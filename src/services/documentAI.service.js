import { DocumentProcessorServiceClient } 
  from "@google-cloud/documentai";

/**
 * Runs OCR and returns the FULL GCS URI
 * where Document AI writes output JSON
 */
const client = new DocumentProcessorServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export async function runOCR(processorName, gcsPdfUrl, ocrJobId) {
  if (!processorName) {
    throw new Error("❌ DOCUMENT_AI_PROCESSOR is not set");
  }

  if (!process.env.GCS_BUCKET_NAME) {
    throw new Error("❌ GCS_BUCKET_NAME is not set");
  }

  const outputPrefix = `ocr/raw-json/job-${ocrJobId}`;

  const request = {
    name: processorName,
    inputDocuments: {
      gcsDocuments: {
        documents: [
          {
            gcsUri: gcsPdfUrl,
            mimeType: "application/pdf",
          },
        ],
      },
    },
    documentOutputConfig: {
      gcsOutputConfig: {
        // ✅ MUST be a full gs:// URI
        gcsUri: `gs://${process.env.GCS_BUCKET_NAME}/${outputPrefix}/`,
      },
    },
  };

  const [operation] = await client.batchProcessDocuments(request);
  await operation.promise();

  // ✅ RETURN FULL URI (this is critical)
  return `gs://${process.env.GCS_BUCKET_NAME}/${outputPrefix}/`;
}
