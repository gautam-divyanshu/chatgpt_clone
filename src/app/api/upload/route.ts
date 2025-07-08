import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { UPLOAD_CONFIG, ENV } from "@/config";

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url?: string;
  width?: number;
  height?: number;
  format?: string;
  access_mode?: string;
}

cloudinary.config({
  cloud_name: ENV.CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const isImage = (
      UPLOAD_CONFIG.SUPPORTED_IMAGE_TYPES as readonly string[]
    ).includes(file.type);
    const isDocument = (
      UPLOAD_CONFIG.SUPPORTED_DOCUMENT_TYPES as readonly string[]
    ).includes(file.type);

    if (!isImage && !isDocument) {
      return NextResponse.json(
        { error: "Unsupported file type" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadOptions: Record<string, unknown> = {
        resource_type: isImage ? "image" : "raw",
        folder: isImage ? "chat-images" : "chat-documents",
        // Don't set custom public_id for documents - let Cloudinary auto-generate
        ...(isImage && {
          public_id: `${Date.now()}-${file.name.replace(
            /[^a-zA-Z0-9.-]/g,
            "_"
          )}`,
        }),
      };
      
      // For documents, try to make them public and let Cloudinary auto-generate public_id
      if (isDocument) {
        uploadOptions.type = "upload";
        uploadOptions.access_mode = "public";
        uploadOptions.use_filename = true; // Use original filename
        uploadOptions.unique_filename = true; // Add unique suffix
      }
      
      console.log('📤 Cloudinary upload options:', uploadOptions);
      
      cloudinary.uploader
        .upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('❌ Cloudinary upload error:', error);
              reject(error);
            } else {
              console.log('✅ Cloudinary upload result:', {
                public_id: result?.public_id,
                secure_url: result?.secure_url,
                url: result?.url,
                access_mode: result?.access_mode,
                type: result?.type,
                resource_type: result?.resource_type
              });
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    const result = uploadResult as CloudinaryUploadResult;

    const uploadedFile = {
      id: result.public_id,
      url: result.url || result.secure_url, // Use HTTP URL which might be more accessible
      originalName: file.name,
      size: file.size,
      type: file.type,
      isImage,
      isDocument: !isImage,
      width: result.width || null,
      height: result.height || null,
      format: result.format || file.type.split("/")[1] || "unknown",
      createdAt: new Date().toISOString(),
    };

    console.log('✅ Final uploadedFile object:', {
      id: uploadedFile.id,
      url: uploadedFile.url,
      isDocument: uploadedFile.isDocument,
      access_mode: result.access_mode
    });

    return NextResponse.json({
      success: true,
      file: uploadedFile,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
