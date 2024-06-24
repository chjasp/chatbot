# Create a Cloud Run service
resource "google_cloud_run_service" "chatbot_service" {
  name     = "ces-gpt"
  location = var.region

  template {
    spec {
      containers {
        image = var.container_image
        env {
          name  = "GEMINI_PROJECT_ID"
          value = var.gemini_project_id
        }
        env {
          name  = "PROJECT_ID"
          value = var.project_id
        }
        env {
          name  = "BUCKET_NAME"
          value = var.bucket_name
        }
        env {
          name  = "GEMINI_MODEL"
          value = var.gemini_model
        }
        env {
          name  = "FIRESTORE_DB"
          value = var.firestore_db
        }
        env {
          name  = "CHATS_COLLECTION"
          value = var.chats_collection
        }
        env {
          name  = "DOC_METADATA_COLLECTION"
          value = var.doc_metadata_collection
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Make the Cloud Run service publicly accessible
resource "google_cloud_run_service_iam_member" "public_access" {
  service  = google_cloud_run_service.chatbot_service.name
  location = google_cloud_run_service.chatbot_service.location
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# Create a Cloud Storage bucket for documents
resource "google_storage_bucket" "document_bucket" {
  name     = var.bucket_name
  location = var.region
}

# Create a Firestore database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = var.firestore_db
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

resource "google_firestore_document" "chats_collection" {
  project     = var.project_id
  collection  = var.chats_collection
  document_id = "initial_doc"
  fields      = "{}"
}

resource "google_firestore_document" "doc_metadata_collection" {
  project     = var.project_id
  collection  = var.doc_metadata_collection
  document_id = "initial_doc"
  fields      = "{}"
}

# Outputs
output "service_url" {
  value = google_cloud_run_service.chatbot_service.status[0].url
}