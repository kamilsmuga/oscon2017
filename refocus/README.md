# Refocus setup

1. Follow this [guide](https://salesforce.github.io/refocus/docs/01-quickstart.html) to deploy your Refocus instance.
2. Create root subject:
```
curl -v -H "Accept: application/json" -H "Content-type: application/json" -X POST -T subject_root.json ${YOUR_REFOCUS_URL}/v1/subjects
```
3. Create child subjects for all projects talked about on OSCON 2017.
  * Edit ```load_subjects.sh``` and provide an URL to your Refocus as a value of the ```YOUR_REFOCUS_URL``` var.
  * Execute ```sh load_subjects.sh```
