variable "project_id" {
  description = "The ID of the GCP project"
}

variable "region" {
  description = "The region to deploy resources"
}

variable "container_image" {
  description = "The container image to deploy"
}

variable "gemini_project_id" {
  description = "The Gemini project ID"
}

variable "bucket_name" {
  description = "The name of the Cloud Storage bucket"
}

variable "gemini_model" {
  description = "The Gemini model to use"
}

variable "firestore_db" {
  description = "The name of the Firestore database"
}

variable "chats_collection" {
  description = "Name of the chats collection in Firestore"
  default     = "chats"
}

variable "doc_metadata_collection" {
  description = "Name of the document metadata collection in Firestore"
  default     = "doc-metadata"
}