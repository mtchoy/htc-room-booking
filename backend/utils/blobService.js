import { BlobServiceClient, BlobSASPermissions, generateBlobSASQueryParameters } from "@azure/storage-blob";

const connStr = process.env.AZURE_STORAGE_CONNECTION_STRING;

const blobServiceClient = BlobServiceClient.fromConnectionString(connStr);

const containerName = "room-booking";
const containerClient = blobServiceClient.getContainerClient(containerName);

var storedPolicyName = null;
var sharedKeyCredential = blobServiceClient.credential;

async function uploadToAzure(foo) {
    const content = foo.data;
    const blobName = `newblob ${+new Date()}.${foo.name.split(".").pop().toLowerCase()}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(content, content.length);
    // console.log(
    //     `Upload block blob ${blobName} successfully with request ID: ${uploadBlobResponse.requestId}`,
    // );
    if (uploadBlobResponse.errorCode) {
        throw new Error(`Failed to upload blob: ${uploadBlobResponse.errorCode}`);
    }
    return blobName;
}

// Create a service SAS for a blob
async function getBlobSasUri(blobName) {
    const sasOptions = {
        containerName: containerClient.containerName,
        blobName: blobName
    };

    if (storedPolicyName == null) {
        sasOptions.startsOn = new Date();
        sasOptions.expiresOn = new Date(new Date().valueOf() + 3600 * 1000);
        sasOptions.permissions = BlobSASPermissions.parse("r");
    } else {
        sasOptions.identifier = storedPolicyName;
    }

    const sasToken = generateBlobSASQueryParameters(sasOptions, sharedKeyCredential).toString();
    // console.log(`SAS token for blob is: ${sasToken}`);

    return `${containerClient.getBlockBlobClient(blobName).url}?${sasToken}`;
}

export { uploadToAzure, getBlobSasUri };