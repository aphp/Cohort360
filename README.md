# Cohort360 meta repository


## Quick start

### Get the code

Start by cloning this repository from a [stable release tag](https://github.com/aphp/Cohort360/releases):

```
git clone --depth 1 --branch <some-release-tag> https://github.com/aphp/Cohort360.git
```

Fetch the corresponding submodules repositories:  
```
git submodule update --init --recursive --remote
```

### Spin it up

Generate fake data with Synthea (for first time execution)
```
docker compose -f docker-compose.yaml -f docker-compose.fakedata.yaml up
```

#### Track fake data generation

Soon after you can go to [http://localhost:8080](http://localhost:8080) to check up the initialization progress
> it may be very long if a lot of fake data patients are generated (default 200 records).

Run without generating fake data (for later executions)
```
docker compose --env-file .env up
```

### About fake data

The base instance contains no data you can use [Synthea](https://github.com/synthetichealth/synthea) to generate some fake data and upload them to the FHIR instance. 

After adding new organizations in FHIR, you **must manually** synchronize them in the backend of the application, for that:  
 * Go to `http://localhost:8000/docs` default URL of the Django backend application
 * Login to acquire an access token using the endpoint `/auth/login/`
 * Make a request to the endpoint `PUT /fhir-perimeters/_sync/`

You should then have the patient data and organization available in the application.

The current Docker Compose sets up an initialization Docker to populate the data it will proceed to generate data with **Synthea** (using a quick fixed fork) and synchronize the perimeters.


## Give it a try

Then you can visit different applications with the following URLs: 
- Main **Cohort360** app : http://localhost:9808
- **Administration Portal** app : http://localhost:9807

> (i) The default credentials are **`admin`**:**`admin`**

