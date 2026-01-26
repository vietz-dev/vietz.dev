---
layout: ../../layouts/MarkdownPostLayout.astro
title: Golang Reverse Proxy
description: Ever wondered how a reverse proxy like traefik works? Let's build one and look behind the magic.
date: 2026-01-26
tags:
  - golang
  - reverse_proxy
  - traefik
draft: false
---

## Mini Traefik

Ever wondered how a reverse proxy like [traefik](https://github.com/traefik/traefik) handles incoming requests and forwards them to the actual upstream? Let's build a very minimal reverse proxy to demystify the internals.

### What even is a reverse proxy?

Okay I try to keep it simple. For a more detailed explanation take a look at [Cloudflare’s](https://www.cloudflare.com/learning/cdn/glossary/reverse-proxy/) definition or [Traefik's](https://traefik.io/glossary/reverse-proxy) documentation. 

```text
client -> proxy -> service
```

A reverse proxy is a piece of software that sits between the client and the server it wants to reach. Instead of the client talking directly to the backend service, all requests go through the reverse proxy first. The proxy forwards the request to the actual server (the upstream) and then returns the server’s response back to the client.

Because all traffic flows through it, a reverse proxy can also inspect or manipulate requests and responses using middleware. For example, it could block all incoming requests that do not include a valid JWT in the Authorization header.

Reverse proxies are typically configured as the main entry point of a server. This allows you to control and manage all incoming traffic in one central place, instead of exposing and configuring each individual service directly.

### Implementation

Let's start by defining a `Route` with an upstream that defines where the requests should be proxied to, a `Prefix` which defines the path of our proxy that will accept requests to forward to and a `Timeout` to handle requests that do not finish in time.

```go
type Route struct {
	Upstream string
	Prefix   string
	Timeout  time.Duration
}
```

We then continue with the actual Reverse Proxy (RProxy) containing the previously defined `Routes` and a httpClient to forward the requests later on. For convenience we also add a `NewRProxy` method that allows easy creation of such a Reverse Proxy.

```go
type RProxy struct {
	Routes     []Route
	httpClient http.Client
}

func NewRProxy(t time.Duration, r []Route) *RProxy {
	return &RProxy{
		Routes: r,
		httpClient: http.Client{
			Timeout: t,
		},
	}
}
```

We implement [ServeHTTP](https://pkg.go.dev/net/http#HandlerFunc) because we want the `RProxy` to act as [HandlerFunc](https://pkg.go.dev/net/http#HandlerFunc) to be able to handle incoming http requests. The ServeHTTP method is not bound to a specific type of HTTP verb (_GET, PUT, POST, ..._) because we want to handle every incoming request, forward it to the defined _Upstream_ and then return back the result of the _Upstream_. If the _Upstream_ does not support the requested verb or path it will tell us and we can return this result.

In the first step we want to determine the route registered in the `RProxy` based on the incoming request. If it does not exist, we can return a 404 and log the requested _Upstream_ is not configured. If however we have a match, we will proxy the request.

```go
func (rp *RProxy) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	route, err := rp.findRoute(r.URL)
	if err != nil {
		msg := "Route not registered"
		http.Error(w, msg, http.StatusNotFound)
		return
	}

	if err := rp.proxyRequest(r.Context(), route, w, r); err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
	}
}
```

To find the registered route we iterate through each of the provided _Routes_ of our _RProxy_ and check if the incoming route's url has the same prefix as one of the _Routes_.

```go
func (rp *RProxy) findRoute(url *url.URL) (*Route, error) {
	for _, route := range rp.Routes {
		if strings.HasPrefix(url.Path, route.Prefix) {
			return &route, nil
		}
	}

	return nil, fmt.Errorf("A route for the url %s is not registered", url)
}
```

Now that we have found the route we can proxy the request to the defined Upstream. For that we define the `proxyRequest` method on the _RProxy_ struct. We first build the correct upstream URL (more on that later), create a context with a timeout matching the defined duration of the route, build a new request with the same method of the incoming requests ones and the same body as we got in the request to our reverse proxy. After that we copy all the provided headers in our request, to our new request and add [X-Forwarded-For](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-For) and [X-Forwarded-Host](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Forwarded-Host) to retain the original connection details. Then we just do the request, copy result body and headers into our result and are finished.

```go
func (rp *RProxy) proxyRequest(ctx context.Context, route *Route, w http.ResponseWriter, r *http.Request) error {
	backendUrl, err := buildUpstreamURL(route, r)
	if err != nil {
		return err
	}

	ctx, cancel := context.WithTimeout(ctx, route.Timeout)
	defer cancel()

	urlStr := backendUrl.String()
	proxyReq, err := http.NewRequestWithContext(ctx, r.Method, urlStr, r.Body)
	defer r.Body.Close()

	maps.Copy(proxyReq.Header, r.Header)

	proxyReq.Header.Add("X-Forwarded-For", r.RemoteAddr)
	proxyReq.Header.Add("X-Forwarded-Host", r.Host)

	res, err := rp.httpClient.Do(proxyReq)
	if err != nil {
		return err
	}
	defer res.Body.Close()

	maps.Copy(w.Header(), res.Header)
	w.WriteHeader(res.StatusCode)
	_, err = io.Copy(w, res.Body)

	return err
}
```

Yeah, above we just assumed `buildUpstreamURL` works. Let's look into it and explain what it does. Initially we create a new URL by parsing the route's _Upstream_. Then we trim the defined _Prefix_ from the incoming requests URL Path with the route's defined _Prefix_. We then set the path of the created base url to the calculated base path and add the query parameters that were available in the incoming request.

```go
func buildUpstreamURL(route *Route, r *http.Request) (*url.URL, error) {
	base, err := url.Parse(route.Upstream)
	if err != nil {
		return nil, err
	}

	trimmed := strings.TrimPrefix(r.URL.Path, route.Prefix)
	basePath, err := url.JoinPath(base.Path, trimmed)
	if err != nil {
		return nil, err
	}

	base.Path = basePath
	base.RawQuery = r.URL.RawQuery

	return base, nil
}
```

Okay we're finished. Let's put this reverse proxy to use:

```go
package main

import (
	"fmt"
	"net/http"
	"time"
)

func main() {

	routes := []Route{
		{
			Upstream: "http://localhost:9090",
			Prefix:   "/api/one",
			Timeout:  10 * time.Second,
		},
		{
			Upstream: "http://localhost:9091",
			Prefix:   "/api/two",
			Timeout:  10 * time.Second,
		},
	}

	proxy := NewRProxy(30*time.Second, routes)

	port := 8080
	server := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: proxy,
	}

	fmt.Printf("Starting proxy on http://127.0.0.1:%d\n\n", port)
	if err := server.ListenAndServe(); err != nil {
		panic(err)
	}
}
```

This `main.go` configures the `RProxy`, starts it under port 8080 and listens for two apis:

- /api/one => http://localhost:9090
- /api/two => http://localhost:9091

### Limitations

So can I use this in production now? **Hell no!** 
This implementation only scratches the surface of what sophisticated reverse proxies like traefik are doing - you should absolutely use something like that.
For real though this implementation does not handle TLS termination, retries or load balancing. It is intentionally minimal and meant for learning purposes only.
That said, some of these topics might be fun to explore in future posts, so stay tuned.