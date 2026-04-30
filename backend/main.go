package main

import (
	"log"
	"net/http"
	"os"

	"dadcraft-dashboard/handlers"
	"dadcraft-dashboard/repository"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // default fallback
	}

	prometheusURL := os.Getenv("PROMETHEUS_URL")
	if prometheusURL == "" {
		prometheusURL = "http://prometheus:9090/api/v1/query?query=" // default fallback (Docker service name)
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	repo := repository.NewPrometheusRepository(prometheusURL)

	diskMountpoint := os.Getenv("DISK_MOUNTPOINT")
	if diskMountpoint == "" {
		diskMountpoint = "/"
	}

	networkDevice := os.Getenv("NETWORK_DEVICE")
	if networkDevice == "" {
		networkDevice = "enp2s15"
	}

	dsn := os.Getenv("DB_DSN")

	dbRepo, err := repository.NewMySQLRepository(dsn)
	if err != nil {
		log.Fatalf("failed to open DB: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", handlers.HandleHealth) // required by docker-compose healthcheck
	mux.HandleFunc("/api/cpu", handlers.GetMetric(repo, `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`))
	mux.HandleFunc("/api/memory", handlers.GetMetric(repo, `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`))
	mux.HandleFunc("/api/swap", handlers.GetMetric(repo, `(1 - (node_memory_SwapFree_bytes / node_memory_SwapTotal_bytes)) * 100`))
	mux.HandleFunc("/api/disk", handlers.GetMetric(repo, `(1 - (node_filesystem_avail_bytes{mountpoint="`+diskMountpoint+`"} / node_filesystem_size_bytes{mountpoint="`+diskMountpoint+`"})) * 100`))
	mux.HandleFunc("/api/io", handlers.GetMetric(repo, `avg by (instance) (rate(node_cpu_seconds_total{mode="iowait"}[5m])) * 100`))
	mux.HandleFunc("/api/load1", handlers.GetMetric(repo, `node_load1`))
	mux.HandleFunc("/api/load5", handlers.GetMetric(repo, `node_load5`))
	mux.HandleFunc("/api/load15", handlers.GetMetric(repo, `node_load15`))
	mux.HandleFunc("/api/rx", handlers.GetMetric(repo, `rate(node_network_receive_bytes_total{device="`+networkDevice+`"}[5m])`))
	mux.HandleFunc("/api/tx", handlers.GetMetric(repo, `rate(node_network_transmit_bytes_total{device="`+networkDevice+`"}[5m])`))
	mux.HandleFunc("/api/mangosd/cpu", handlers.GetMetric(repo, `sum(rate(namedprocess_namegroup_cpu_seconds_total{groupname="mangosd"}[5m])) * 100`))
	mux.HandleFunc("/api/mangosd/memory", handlers.GetMetric(repo, `namedprocess_namegroup_memory_bytes{groupname="mangosd",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/mangosd/procs", handlers.GetMetric(repo, `namedprocess_namegroup_num_procs{groupname="mangosd"}`))
	mux.HandleFunc("/api/realmd/cpu", handlers.GetMetric(repo, `sum(rate(namedprocess_namegroup_cpu_seconds_total{groupname="realmd"}[5m])) * 100`))
	mux.HandleFunc("/api/realmd/memory", handlers.GetMetric(repo, `namedprocess_namegroup_memory_bytes{groupname="realmd",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/realmd/procs", handlers.GetMetric(repo, `namedprocess_namegroup_num_procs{groupname="realmd"}`))
	mux.HandleFunc("/api/mysqld/cpu", handlers.GetMetric(repo, `sum(rate(namedprocess_namegroup_cpu_seconds_total{groupname="mysqld"}[5m])) * 100`))
	mux.HandleFunc("/api/mysqld/memory", handlers.GetMetric(repo, `namedprocess_namegroup_memory_bytes{groupname="mysqld",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/mysqld/procs", handlers.GetMetric(repo, `namedprocess_namegroup_num_procs{groupname="mysqld"}`))
	mux.HandleFunc("/api/db/characters/count", handlers.GetDBScalar(dbRepo, "SELECT COUNT(*) FROM characters"))
	mux.HandleFunc("/api/db/characters/online", handlers.GetDBScalar(dbRepo, "SELECT COUNT(*) FROM characters WHERE online = 1"))
	mux.HandleFunc("/api/db/guilds", handlers.GetDBScalar(dbRepo, "SELECT COUNT(*) FROM guild"))
	mux.HandleFunc("/api/db/auctions", handlers.GetDBScalar(dbRepo, "SELECT COUNT(*) FROM auction"))
	mux.HandleFunc("/api/db/tickets", handlers.GetDBScalar(dbRepo, "SELECT COUNT(*) FROM gm_tickets"))
	mux.HandleFunc("/api/db/characters/race", handlers.GetDBDistribution(dbRepo, `SELECT CASE race WHEN 1 THEN 'Human' WHEN 2 THEN 'Orc' WHEN 3 THEN 'Dwarf' WHEN 4 THEN 'Night Elf' WHEN 5 THEN 'Undead' WHEN 6 THEN 'Tauren' WHEN 7 THEN 'Gnome' WHEN 8 THEN 'Troll' ELSE 'Unknown' END, COUNT(*) FROM characters GROUP BY race ORDER BY race`))
	mux.HandleFunc("/api/db/characters/class", handlers.GetDBDistribution(dbRepo, `SELECT CASE class WHEN 1 THEN 'Warrior' WHEN 2 THEN 'Paladin' WHEN 3 THEN 'Hunter' WHEN 4 THEN 'Rogue' WHEN 5 THEN 'Priest' WHEN 7 THEN 'Shaman' WHEN 8 THEN 'Mage' WHEN 9 THEN 'Warlock' WHEN 11 THEN 'Druid' ELSE 'Unknown' END, COUNT(*) FROM characters GROUP BY class ORDER BY class`))

	http.ListenAndServe(":"+port, handlers.CorsMiddleware(allowedOrigin, mux))
}
