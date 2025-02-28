package database

import (
	"log"
	"log/slog"
	c "pry-teams/src/lib/common"
	"pry-teams/src/model"
	"sync"
	"time"

	s "github.com/supabase-community/supabase-go"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	"gorm.io/gorm/schema"
)

var (
	db       *gorm.DB
	once     sync.Once
	supabase *s.Client
)

var Schema = &[]interface{}{
	&model.Room{},
	&model.People{},
	&model.PeopleWaiting{},
	&model.RoomControl{},
	&model.UserAccess{},
}

func Connect() {
	once.Do(func() {
		var err error
		db, err = gorm.Open(postgres.Open(c.Env("DATABASE_URL")), &gorm.Config{
			TranslateError: true,
			Logger:         logger.Default.LogMode(logger.Silent),
			NamingStrategy: schema.NamingStrategy{
				// SingularTable: true,
			},
		})

		if err != nil {
			slog.Error("Database connection", slog.Any("error", err))
			panic(err)
		}

		sqlDB, err := db.DB()
		if err != nil {
			log.Fatalf("Database SQL DB instance error: %v", err)
		}

		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetMaxIdleConns(5)
		sqlDB.SetConnMaxLifetime(time.Hour)

		if c.Env("DB_AUTO_MIGRATE") == "true" {
			err := db.Debug().AutoMigrate(*Schema...)
			if err != nil {
				log.Fatalf("Migration error: %v", err)
			}
		}

		supabase, err = s.NewClient(
			c.Env("SUPABASE_URL"),
			c.Env("SUPABASE_ANON_KEY"),
			&s.ClientOptions{},
		)

		if err != nil {
			log.Fatalf("Initalize supbase client error: %v", err)
		}

		slog.Info("Database connected")
	})
}

func DB() *gorm.DB {
	return db
}

func Supabase() *s.Client {
	return supabase
}

func Disconnect() error {
	instance, err := db.DB()
	if err != nil {
		return err
	}

	if err = instance.Close(); err != nil {
		return err
	}

	db = nil
	return nil
}

func CleanUp() {
	slog.Info("Cleaning up database...")

	if err := db.Exec("DELETE FROM people").Error; err != nil {
		log.Printf("Error deleting from people: %v\n", err)
	}

	if err := db.Exec("DELETE FROM people_waiting").Error; err != nil {
		log.Printf("Error deleting from people_waiting: %v\n", err)
	}

	slog.Info("Database cleanup completed.")
}
