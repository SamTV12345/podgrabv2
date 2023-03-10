FROM node:alpine as ui-builder

WORKDIR /app
COPY ./ui/ ./
RUN  npm install && npm run build


FROM rust:alpine3.17 as builder

WORKDIR /app/src

RUN apk add pkgconfig openssl-dev libc-dev
RUN USER=root

ADD src ./src
ADD static ./static
ADD Cargo.toml .
RUN RUSTFLAGS='-C target-feature=-crt-static' cargo build --release

FROM alpine:latest
WORKDIR /app
RUN apk add libgcc tzdata
ENV TZ=Europe/Berlin

COPY --from=builder /app/src/target/release/podgrabv2 /app/podgrabv2
COPY --from=ui-builder /app/dist /app/static

EXPOSE 8000
CMD ["/app/podgrabv2"]