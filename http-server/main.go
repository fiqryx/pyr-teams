package main

import (
	"context"
	"errors"
	"flag"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	c "pry-teams/src/lib/common"
	"pry-teams/src/lib/database"
	"pry-teams/src/middleware"
	r "pry-teams/src/repository"
	"pry-teams/src/routes"
	"pry-teams/src/services"
	"syscall"
	"time"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	peer "github.com/muka/peerjs-go/server"
	"github.com/zishang520/socket.io/v2/socket"
)

type Server struct {
	httpServer *http.Server
	peerServer *peer.PeerServer
}

var (
	certFile = "../certificates/localhost.pem"
	certKey  = "../certificates/localhost-key.pem"
	host     = c.Env("HOST")
	port     = c.Env("PORT")
	address  = fmt.Sprintf("%s:%s", host, port)
)

func main() {
	gin.SetMode(gin.ReleaseMode)
	log.SetFlags(log.LstdFlags | log.Lshortfile)
	database.Connect()

	server := NewServer()
	info := GetVersionInfo()
	showVersion := flag.Bool("version", info.Show, "Show version information")

	flag.Parse()

	ctx, cancel := context.WithCancel(context.Background())
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, os.Interrupt, syscall.SIGTERM)

	go func() {
		<-sig
		slog.Info("Shutdown server...")
		cancel()
	}()

	go func() {
		database.CleanUp()
		if *showVersion {
			slog.Info("System",
				slog.String("version", info.Version),
				slog.String("go", info.Go),
				slog.String("compiler", info.Compiler),
				slog.String("platform", info.Platform),
			)
		}
		server.Start()
	}()

	<-ctx.Done()

	database.CleanUp()
	if err := database.Disconnect(); err != nil {
		slog.Error("Close database connection", slog.Any("error", err))
		panic(err)
	}
	slog.Info("Database disconnected")

	server.Stop(10 * time.Second)
}

func NewServer() *Server {
	db := database.DB()
	repo := r.NewContext(db)
	services := services.NewContext(repo)

	s := socket.NewServer(nil, nil)
	sc := socket.DefaultServerOptions()

	CreateEvent(s, services)

	r := gin.Default()
	r.Static("/public", "public")
	r.StaticFile("/favicon.ico", "public/logo.ico")
	r.Use(gzip.Gzip(gzip.DefaultCompression))
	r.Use(middleware.Cors())
	r.GET("/socket.io/*any", gin.WrapH(s.ServeHandler(sc)))
	r.POST("/socket.io/*any", gin.WrapH(s.ServeHandler(sc)))
	r.Use(middleware.SupbaseAuth())
	routes.Api(r.Group("/api"), services)

	op := peer.NewOptions()
	op.Host = host
	op.Key = "peerjs"
	op.Path = "/"

	return &Server{
		peerServer: peer.New(op),
		httpServer: &http.Server{
			Addr:    address,
			Handler: r,
		},
	}
}

func (s *Server) Start() {
	slog.Info("Server started", slog.String("host", host))

	if c.Env("EXPERIMENTAL_HTTPS") == "true" {
		if err := s.peerServer.StartTLS(certFile, certKey); err != nil {
			slog.Error("Start Peer server", slog.Any("error", err))
			panic("Start Peer server")
		}

		err := s.httpServer.ListenAndServeTLS(certFile, certKey)
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("Start Https server", slog.Any("error", err))
			panic("Start Http server")
		}
	} else {
		if err := s.peerServer.Start(); err != nil {
			slog.Error("Start Peer server", slog.Any("error", err))
			panic("Start Peer server")
		}

		err := s.httpServer.ListenAndServe()
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			slog.Error("Start Http server", slog.Any("error", err))
			panic("Start Http server")
		}
	}
}

func (s *Server) Stop(timeout time.Duration) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	if err := s.peerServer.Stop(); err != nil {
		slog.Error("Stop Peer server", slog.Any("error", err))
		panic("Stop Peer server")
	}

	if err := s.httpServer.Shutdown(ctx); err != nil {
		slog.Error("Stop Http server", slog.Any("error", err))
		panic("Stop Http server")
	}

	slog.Info("Server stopped")
}
