import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { contactSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate the request body
    const validatedData = contactSchema.parse(body);

    // Note: The schema doesn't have a contact_messages table.
    // For now, we'll create a client record to store contact form submissions.
    // Consider adding a contact_messages table to the schema if you need to store contact messages separately.
    const { data, error } = await supabase
      .from("clients")
      .insert({
        first_name: validatedData.firstName,
        last_name: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || "",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    return NextResponse.json(
      {
        success: true,
        message: data,
        text: "Contact message sent successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating contact message:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to send contact message",
      },
      { status: 500 },
    );
  }
}
