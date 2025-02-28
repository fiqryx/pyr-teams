## How to Run
- Default running server
```bash
$ go run .
```

- Running with hot-reload
```bash
$ nodemon .
```

---

### How to test
```bash
$ go test -v -run=^$ -bench . ./test
```

### Generate vendor
Downloads all the dependencies specified in `go.mod` file and places them inside the `vendor/`
```bash
$ go mod vendor
```

### How to Build
```bash
$ go build -o build/server
# or
$ go build -ldflags "-X main.version=1.0.0-dev" -o build/server
# with vendor
$ go build -mod=vendor -o build/server
# flags and vendor
$ go build -mod=vendor -ldflags "-X main.version=1.0.0-dev" -o build/server
```