import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createClient, createReservation, getReservations, updateReservationStatus, getLocationById } from "@/lib/supabaseService";
import type { ReservationStatus } from "@/components/models/reservations";

interface ReservationRequestBody {
  vehicleType: { id: string };
  service: { id: string };
  additionalServices?: {
    babySeats?: number;
    boosters?: number;
    meetAndGreet?: boolean;
  };
  serviceSubData?: Record<string, any>;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    pickup?: string;
    destination?: string;
    passengers?: number;
    notes?: string;
  };
  status?: ReservationStatus;
  totalPrice: number;
}

interface PatchRequestBody {
  id: string;
  status: ReservationStatus;
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== RESERVATION API CALL STARTED ===");
    
    const body = await request.json() as ReservationRequestBody;
    console.log("Request body received:", JSON.stringify(body, null, 2));
    
    const { vehicleType, service, additionalServices, serviceSubData, formData, status, totalPrice } = body;

    // Validate required fields
    if (!vehicleType || !service || !formData) {
      console.error("Missing required fields:", { 
        vehicleType: !!vehicleType, 
        service: !!service, 
        formData: !!formData 
      });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          details: `Missing: ${!vehicleType ? 'vehicleType ' : ''}${!service ? 'service ' : ''}${!formData ? 'formData' : ''}`
        },
        { status: 400 },
      );
    }

    console.log("Starting client creation/lookup...");
    
    // Create or find client
    let client;
    try {
      client = await createClient({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            phone: formData.phone,
      });
      console.log("Client created/found:", client.id);
    } catch (userError) {
      console.error("Error handling client:", userError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create or find client",
          details: userError instanceof Error ? userError.message : "Unknown error",
        },
        { status: 500 },
      );
    }

    console.log("Starting reservation creation...");
    
    // Get location and destination from formData (already mapped from service_fields)
    // For airport transfers, formData.pickup/destination may contain location IDs, so convert to names
    let pickupLocationName = formData.pickup || '';
    let destinationName = formData.destination || '';
    
    // For airport transfers, if location/destination are IDs, convert to names
    if (service.id === 'airport-transfers' && serviceSubData) {
      // Check if location is an ID (short string like 'paris', 'cdg')
      if (pickupLocationName && pickupLocationName.length < 20 && /^[a-z0-9_-]+$/.test(pickupLocationName.toLowerCase())) {
        const pickupLocation = await getLocationById(pickupLocationName);
        if (pickupLocation) {
          pickupLocationName = pickupLocation.name;
        }
      }
      
      // Check if destination is an ID
      if (destinationName && destinationName.length < 20 && /^[a-z0-9_-]+$/.test(destinationName.toLowerCase())) {
        const destinationLocation = await getLocationById(destinationName);
        if (destinationLocation) {
          destinationName = destinationLocation.name;
        }
      }
    }
    
    // Validate that we have pickup location (destination is optional for some services)
    if (!pickupLocationName) {
      console.error("Missing pickup location:", { locationName: pickupLocationName, destinationName, serviceSubData, formData });
      return NextResponse.json(
        {
          success: false,
          error: "Missing required pickup location",
        },
        { status: 400 },
      );
    }
    
    // Create reservation in Supabase
    const reservation = await createReservation({
      clientId: client.id,
        serviceId: service.id,
      vehicleTypeId: vehicleType.id,
      date: formData.date,
      time: formData.time,
      pickupLocation: pickupLocationName,
      destinationLocation: destinationName || null,
      passengers: formData.passengers || 1,
      babySeats: additionalServices?.babySeats || 0,
      boosterSeats: additionalServices?.boosters || 0,
      meetAndGreet: additionalServices?.meetAndGreet || false,
      serviceSubData: serviceSubData || undefined,
      notes: formData.notes || undefined,
        totalPrice: totalPrice,
      status: (status as ReservationStatus) || 'pending',
    });

    console.log("Reservation created successfully:", reservation.id);

    console.log("=== RESERVATION API CALL COMPLETED SUCCESSFULLY ===");

    return NextResponse.json(
      {
        success: true,
        reservation: reservation,
        message: "Reservation created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("=== RESERVATION API CALL FAILED ===");
    console.error("Error creating reservation:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reservation",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as ReservationStatus | null;
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await getReservations({
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      reservations: result.data,
      total: result.total,
    });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch reservations",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json() as PatchRequestBody;
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    const updatedReservation = await updateReservationStatus(id, status as ReservationStatus);

    return NextResponse.json({
      success: true,
      reservation: updatedReservation,
      message: "Reservation updated successfully",
    });
  } catch (error) {
    console.error("Error updating reservation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update reservation",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
