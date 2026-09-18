FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/wastewise-backend-0.1.0.jar app.jar
EXPOSE 8080
# Render injects PORT=10000, application.properties reads ${PORT:8080}
CMD ["java", "-jar", "app.jar"]
