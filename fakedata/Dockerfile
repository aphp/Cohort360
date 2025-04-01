FROM eclipse-temurin:17

RUN apt update && apt install -y jq bc python3

ADD . /app
WORKDIR /app/synthea
RUN ./gradlew build -x test shadowJar
RUN tar xvf build/distributions/synthea-shadow.tar

WORKDIR /app
RUN chmod +x /app/generate.sh
ENTRYPOINT ["/app/generate.sh"]

