package main

import (
	"fmt"
	"runtime"
)

var (
	version = "1.0.0"
	build   = "1970-01-01T00:00:00Z"
)

type VersionInfo struct {
	Show     bool   `json:"-" yaml:"-"`
	Version  string `json:"version" yaml:"version"`
	Build    string `json:"build" yaml:"build"`
	Go       string `json:"go" yaml:"go"`
	Compiler string `json:"compiler" yaml:"compiler"`
	Platform string `json:"platform" yaml:"platform"`
}

// Get returns the overall codebase version. It's for detecting
// what code a binary was built from.
func GetVersionInfo() *VersionInfo {
	// These variables typically come from -ldflags settings and in
	// their absence fallback to the constants above
	return &VersionInfo{
		Show:     true,
		Version:  version,
		Build:    build,
		Go:       runtime.Version(),
		Compiler: runtime.Compiler,
		Platform: fmt.Sprintf("%s/%s", runtime.GOOS, runtime.GOARCH),
	}
}
