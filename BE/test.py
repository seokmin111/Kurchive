import oci
config = oci.config.from_file("~/.oci/config")
object_storage = oci.object_storage.ObjectStorageClient(config)
print(object_storage.list_buckets(config["tenancy"], "kurchive-namespace"))
