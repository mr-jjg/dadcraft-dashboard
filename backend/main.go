package main

import (
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

	repo := repository.NewRepository(prometheusURL)

	diskMountpoint := os.Getenv("DISK_MOUNTPOINT")
	if diskMountpoint == "" {
		diskMountpoint = "/"
	}

	networkDevice := os.Getenv("NETWORK_DEVICE")
	if networkDevice == "" {
		networkDevice = "enp2s15"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", handlers.HandleHealth)
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

	http.ListenAndServe(":"+port, handlers.CorsMiddleware(allowedOrigin, mux))
}
