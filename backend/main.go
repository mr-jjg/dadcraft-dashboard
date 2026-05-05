package main

import (
	"log"
	"net/http"
	"os"

	"dadcraft-dashboard/handlers"
	"dadcraft-dashboard/models"
	"dadcraft-dashboard/repository"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081" // default fallback
	}

	prometheusURL := os.Getenv("PROMETHEUS_URL")
	if prometheusURL == "" {
		prometheusURL = "http://prometheus:9090/api/v1/" // default fallback (Docker service name)
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")

	promRepo := repository.NewPrometheusRepository(prometheusURL)

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
	mux.HandleFunc("/metrics/progression", handlers.ProgressionExporter(dbRepo))
	mux.HandleFunc("/metrics/leaderboard",  handlers.LeaderboardExporter(dbRepo))
	mux.HandleFunc("/api/health", handlers.HandleHealth) // required by docker-compose healthcheck
	mux.HandleFunc("/api/system/uptime", handlers.GetMetric(promRepo, `time() - node_boot_time_seconds`))
	mux.HandleFunc("/api/system/load1", handlers.GetMetric(promRepo, `node_load1`))
	mux.HandleFunc("/api/system/load1/range",   handlers.GetMetricRange(promRepo, `node_load1`))
	mux.HandleFunc("/api/system/load5", handlers.GetMetric(promRepo, `node_load5`))
	mux.HandleFunc("/api/system/load5/range",   handlers.GetMetricRange(promRepo, `node_load5`))
	mux.HandleFunc("/api/system/load15", handlers.GetMetric(promRepo, `node_load15`))
	mux.HandleFunc("/api/system/load15/range",  handlers.GetMetricRange(promRepo, `node_load15`))
	mux.HandleFunc("/api/system/cpu", handlers.GetMetric(promRepo, `100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)`))
	mux.HandleFunc("/api/system/memory", handlers.GetMetric(promRepo, `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`))
	mux.HandleFunc("/api/system/memory/range",  handlers.GetMetricRange(promRepo, `(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100`))
	mux.HandleFunc("/api/system/swap", handlers.GetMetric(promRepo, `(1 - (node_memory_SwapFree_bytes / node_memory_SwapTotal_bytes)) * 100`))
	mux.HandleFunc("/api/system/disk", handlers.GetMetric(promRepo, `(1 - (node_filesystem_avail_bytes{mountpoint="`+diskMountpoint+`"} / node_filesystem_size_bytes{mountpoint="`+diskMountpoint+`"})) * 100`))
	mux.HandleFunc("/api/system/io", handlers.GetMetric(promRepo, `avg by (instance) (rate(node_cpu_seconds_total{mode="iowait"}[5m])) * 100`))
	mux.HandleFunc("/api/system/rx", handlers.GetMetric(promRepo, `rate(node_network_receive_bytes_total{device="`+networkDevice+`"}[5m])`))
	mux.HandleFunc("/api/system/tx", handlers.GetMetric(promRepo, `rate(node_network_transmit_bytes_total{device="`+networkDevice+`"}[5m])`))
	mux.HandleFunc("/api/mangosd/uptime", handlers.GetMetric(promRepo, `time() - namedprocess_namegroup_oldest_start_time_seconds{groupname="mangosd"}`))
	mux.HandleFunc("/api/mangosd/cpu", handlers.GetMetric(promRepo, `sum(rate(namedprocess_namegroup_cpu_seconds_total{groupname="mangosd"}[5m])) * 100`))
	mux.HandleFunc("/api/mangosd/memory", handlers.GetMetric(promRepo, `namedprocess_namegroup_memory_bytes{groupname="mangosd",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/mangosd/memory/range", handlers.GetMetricRange(promRepo, `namedprocess_namegroup_memory_bytes{groupname="mangosd",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/mangosd/procs", handlers.GetMetric(promRepo, `namedprocess_namegroup_num_procs{groupname="mangosd"}`))
	mux.HandleFunc("/api/realmd/uptime", handlers.GetMetric(promRepo, `time() - namedprocess_namegroup_oldest_start_time_seconds{groupname="realmd"}`))
	mux.HandleFunc("/api/realmd/cpu", handlers.GetMetric(promRepo, `sum(rate(namedprocess_namegroup_cpu_seconds_total{groupname="realmd"}[5m])) * 100`))
	mux.HandleFunc("/api/realmd/memory", handlers.GetMetric(promRepo, `namedprocess_namegroup_memory_bytes{groupname="realmd",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/realmd/memory/range", handlers.GetMetricRange(promRepo, `namedprocess_namegroup_memory_bytes{groupname="realmd",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/realmd/procs", handlers.GetMetric(promRepo, `namedprocess_namegroup_num_procs{groupname="realmd"}`))
	mux.HandleFunc("/api/mysqld/uptime", handlers.GetMetric(promRepo, `time() - namedprocess_namegroup_oldest_start_time_seconds{groupname="mysqld"}`))
	mux.HandleFunc("/api/mysqld/cpu", handlers.GetMetric(promRepo, `sum(rate(namedprocess_namegroup_cpu_seconds_total{groupname="mysqld"}[5m])) * 100`))
	mux.HandleFunc("/api/mysqld/memory", handlers.GetMetric(promRepo, `namedprocess_namegroup_memory_bytes{groupname="mysqld",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/mysqld/memory/range", handlers.GetMetricRange(promRepo, `namedprocess_namegroup_memory_bytes{groupname="mysqld",memtype="resident"} / 1048576`))
	mux.HandleFunc("/api/mysqld/procs", handlers.GetMetric(promRepo, `namedprocess_namegroup_num_procs{groupname="mysqld"}`))
	mux.HandleFunc("/api/progression", handlers.GetProgression(promRepo))
	mux.HandleFunc("/api/progression/timestamps", handlers.GetProgressionTimestamps(promRepo))
	mux.HandleFunc("/api/db/characters/count", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"count"}, "characters", "")))
	mux.HandleFunc("/api/db/characters/online", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"count"}, "characters", "WHERE online = 1")))
	mux.HandleFunc("/api/db/guilds", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"count"}, "guild", "")))
	mux.HandleFunc("/api/db/auctions", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"count"}, "auction", "")))
	mux.HandleFunc("/api/db/tickets", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"count"}, "gm_tickets", "")))
	mux.HandleFunc("/api/db/characters/race", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"race", "count"}, "characters", "GROUP BY race ORDER BY race")))
	mux.HandleFunc("/api/db/characters/class", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"class", "count"}, "characters", "GROUP BY class ORDER BY class")))
	mux.HandleFunc("/api/db/characters/level", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"level", "count"}, "characters", "GROUP BY level ORDER BY level")))
	mux.HandleFunc("/api/db/characters/namelevelclass", handlers.GetDBQuery(dbRepo, models.BuildQuery([]string{"name", "level", "class"}, "characters", "WHERE online = 1 ORDER BY level DESC")))

	http.ListenAndServe(":"+port, handlers.CorsMiddleware(allowedOrigin, mux))
}
