import { DocumentProcessorServiceClient } 
  from "@google-cloud/documentai";
import { Storage } from "@google-cloud/storage";

const client = new DocumentProcessorServiceClient();
const storage = new Storage();

/**
 * Runs OCR and returns the GCS folder where output JSON is written
 */
export async function runOCR(processorName, gcsPdfUrl, ocrJobId) {
  if (!processorName) {
    throw new Error("DOCUMENT_AI_PROCESSOR is not set");
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
        gcsUri: `gs://${process.env.GCS_BUCKET_NAME}/${outputPrefix}/`,
      },
    },
  };

  const [operation] = await client.batchProcessDocuments(request);
  await operation.promise();

  return outputPrefix;
}
