# Cohort360 meta repository


## Quick start

```
docker-compose --env-file .env up
```

Then you can go to the Cohort 360 application with the following urls : 
- main application : http://localhost:9808
- admin portal : http://localhost:9807
- keycloak authentication: http://172.28.0.20:8080

The default credentials are admin:admin


The base instance contains no data you can use [Synthea](https://github.com/synthetichealth/synthea) to generate some fake data and upload them to the FHIR instance. 

After adding new Organizations in FHIR, you must manually synchronize them in the backend of the application, for that
go to `http://localhost:8000/docs` (default url of the backend application), login (using the oidc secret found in the file `env/django.env` `OIDC_CLIENT_SECRET_1`) and then execute the query of the endpoint `PUT /fhir-perimeters/_sync/`. You should then have the patient data and organization available in the application.


