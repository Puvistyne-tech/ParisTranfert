import {
  Document,
  Font,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type React from "react";

// Register fonts for better typography
Font.register({
  family: "Helvetica",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/opensans/v18/mem8YaGs126MiZpBA-UFVZ0e.ttf",
      fontWeight: "normal",
    },
    {
      src: "https://fonts.gstatic.com/s/opensans/v18/mem5YaGs126MiZpBA-UN7rgOUuhp.ttf",
      fontWeight: "bold",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Helvetica",
    justifyContent: "space-between",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#1e40af",
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 3,
  },
  companySubtitle: {
    fontSize: 10,
    color: "#6b7280",
    fontWeight: "normal",
  },
  tripCard: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    flexDirection: "column",
  },
  tripInfo: {
    flex: 1,
    marginBottom: 8,
  },
  tripInfoRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tripInfoColumn: {
    flex: 1,
    minWidth: "45%",
    marginRight: 8,
    marginBottom: 4,
  },
  tripTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 8,
  },
  tripRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  tripLabel: {
    fontSize: 9,
    color: "#6b7280",
    width: 90,
    fontWeight: "bold",
  },
  tripValue: {
    fontSize: 9,
    color: "#1f2937",
    flex: 1,
  },
  reservationId: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1e40af",
    backgroundColor: "#eff6ff",
    padding: "6 10",
    borderRadius: 6,
    textAlign: "center",
    alignSelf: "flex-start",
  },
  statusBanner: {
    padding: "8 15",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderStyle: "solid",
  },
  contentGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  leftColumn: {
    flex: 1,
    marginRight: 10,
  },
  rightColumn: {
    flex: 1,
    marginLeft: 10,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontSize: 8,
    color: "#6b7280",
    width: 80,
    fontWeight: "bold",
  },
  value: {
    fontSize: 8,
    color: "#1f2937",
    flex: 1,
  },
  statusBadge: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
    padding: "2 6",
    borderRadius: 3,
    fontSize: 7,
    fontWeight: "bold",
    textAlign: "center",
  },
  priceSection: {
    backgroundColor: "#f9fafb",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  priceLabel: {
    fontSize: 8,
    color: "#6b7280",
  },
  priceValue: {
    fontSize: 8,
    color: "#1f2937",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 10,
    color: "#1f2937",
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 12,
    color: "#059669",
    fontWeight: "bold",
  },
  notes: {
    backgroundColor: "#f0f9ff",
    padding: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  notesText: {
    fontSize: 8,
    color: "#374151",
    lineHeight: 1.3,
  },
  footer: {
    marginTop: "auto",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerLeft: {
    flex: 1,
  },
  footerRight: {
    flex: 1,
    textAlign: "right",
  },
  footerTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 3,
  },
  footerText: {
    fontSize: 7,
    color: "#6b7280",
    marginBottom: 2,
  },
  importantNotes: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#fecaca",
    padding: 8,
    borderRadius: 4,
    marginTop: 15,
  },
  importantTitle: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 3,
  },
  importantText: {
    fontSize: 7,
    color: "#7f1d1d",
    lineHeight: 1.2,
    marginBottom: 2,
  },
});

interface ReservationPDFData {
  reservationId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicleTypeName: string;
  vehicleTypeDescription?: string;
  serviceName: string;
  serviceDescription: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  destinationLocation: string | null;
  passengers: number;
  babySeats: number;
  boosterSeats: number;
  meetAndGreet: boolean;
  totalPrice: number;
  notes?: string;
  status: string;
  createdAt: string;
  serviceSubData?: Record<string, any>; // Service-specific fields
}

export interface PDFTranslations {
  companyName: string;
  companySubtitle: string;
  reservationStatus: string;
  tripDetails: string;
  date: string;
  time: string;
  from: string;
  to: string;
  vehicleTypeService: string;
  vehicleType: string;
  service: string;
  passengers: string;
  customer: string;
  name: string;
  email: string;
  phone: string;
  description: string;
  additionalServices: string;
  babySeats: string;
  boosters: string;
  meetAndGreet: string;
  free: string;
  pricing: string;
  basePrice: string;
  total: string;
  notes: string;
  importantInformation: string;
  importantNote1: string;
  importantNote2: string;
  importantNote3: string;
  importantNote4: string;
  importantNote5: string;
  contactInformation: string;
  thankYou: string;
  thankYouMessage: string;
  generated: string;
  quoteMessage: string;
  referenceNumber: string;
  created: string;
}

interface ReservationPDFProps {
  data: ReservationPDFData;
  translations: PDFTranslations;
}

export const ReservationPDF: React.FC<ReservationPDFProps> = ({
  data,
  translations,
}) => {
  // Additional services are free
  const additionalServicesTotal = 0;

  // Check if status is a quote status
  const isQuoteStatus =
    data.status.toLowerCase() === "quote_requested" ||
    data.status.toLowerCase() === "quote_sent" ||
    data.status.toLowerCase() === "quote_accepted";

  // Use the totalPrice directly from the reservation
  // For Disneyland return trips, check if price needs to be doubled
  // (price might be stored as base price in database, not doubled)
  let finalPrice = data.totalPrice;
  const isDisneyland = data.serviceName.toLowerCase().includes("disneyland");
  const hasReturnTrip = data.serviceSubData?.return_trip === true;
  
  // If Disneyland with return trip and price seems like base price (80-90 range), double it
  if (
    isDisneyland &&
    hasReturnTrip &&
    finalPrice > 0 &&
    finalPrice < 150 // Base prices are typically 80-90, so if less than 150, likely needs doubling
  ) {
    finalPrice = finalPrice * 2;
  }

  // Show pricing if price > 0 (for all services)
  // Always show pricing section - either with price or quote message
  const shouldShowPricing = finalPrice > 0;
  const shouldShowQuoteMessage = finalPrice === 0 || (isQuoteStatus && finalPrice === 0);

  // Helper function to format service-specific field labels
  const formatFieldLabel = (key: string): string => {
    const labelMap: Record<string, string> = {
      flight_number: "Flight Number",
      hotel_name: "Hotel Name",
      pickup_address: "Pickup Address",
      return_trip: "Return Trip",
      return_date: "Return Date",
      return_time: "Return Time",
      pickup_location: "Pickup Location",
      destination_location: "Destination Location",
    };
    return labelMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Helper function to format service-specific field values
  const formatFieldValue = (key: string, value: any): string => {
    if (value === null || value === undefined || value === "") {
      return "N/A";
    }
    if (key === "return_trip") {
      return value === true ? "Yes" : "No";
    }
    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }
    return String(value);
  };

  // Filter out null/empty fields - only show fields with actual values
  const shouldDisplayField = (key: string, value: any): boolean => {
    // Skip null, undefined, or empty string values
    if (value === null || value === undefined || value === "") {
      return false;
    }
    return true;
  };

  // Status color mapping
  const getStatusColors = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    switch (normalizedStatus) {
      case "quote_requested":
        return {
          backgroundColor: "#fff7ed",
          color: "#c2410c",
          borderColor: "#fb923c",
        };
      case "pending":
        return {
          backgroundColor: "#fefce8",
          color: "#854d0e",
          borderColor: "#eab308",
        };
      case "quote_sent":
        return {
          backgroundColor: "#faf5ff",
          color: "#6b21a8",
          borderColor: "#a855f7",
        };
      case "quote_accepted":
        return {
          backgroundColor: "#f0fdf4",
          color: "#166534",
          borderColor: "#22c55e",
        };
      case "confirmed":
        return {
          backgroundColor: "#f0fdf4",
          color: "#166534",
          borderColor: "#22c55e",
        };
      case "completed":
        return {
          backgroundColor: "#f0f9ff",
          color: "#0c4a6e",
          borderColor: "#0ea5e9",
        };
      case "cancelled":
        return {
          backgroundColor: "#fef2f2",
          color: "#991b1b",
          borderColor: "#ef4444",
        };
      default:
        return {
          backgroundColor: "#f3f4f6",
          color: "#374151",
          borderColor: "#9ca3af",
        };
    }
  };

  const statusColors = getStatusColors(data.status);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header with Logo */}
        <View style={styles.header}>
          <Image style={styles.logo} src="/logo.png" />
          <View style={styles.headerText}>
            <Text style={styles.companyName}>{translations.companyName}</Text>
            <Text style={styles.companySubtitle}>
              {translations.companySubtitle}
            </Text>
          </View>
          <Text style={styles.reservationId}>#{data.reservationId}</Text>
        </View>

        {/* Status Banner */}
        <Text
          style={[
            styles.statusBanner,
            {
              backgroundColor: statusColors.backgroundColor,
              color: statusColors.color,
              borderColor: statusColors.borderColor,
            },
          ]}
        >
          {translations.reservationStatus}: {data.status.toUpperCase()}
        </Text>

        {/* Main Content - flex: 1 to push footer down */}
        <View style={{ flex: 1 }}>
        {/* Trip Information Card - Main Box with all important details */}
        <View style={styles.tripCard}>
          <Text style={styles.tripTitle}>{translations.tripDetails}</Text>
          <View style={styles.tripInfoRow}>
            <View style={styles.tripInfoColumn}>
              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>{translations.date}:</Text>
                <Text style={styles.tripValue}>{data.pickupDate}</Text>
              </View>
              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>{translations.time}:</Text>
                <Text style={styles.tripValue}>{data.pickupTime}</Text>
              </View>
              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>{translations.from}:</Text>
                <Text style={styles.tripValue}>{data.pickupLocation}</Text>
              </View>
              {data.destinationLocation && (
                <View style={styles.tripRow}>
                  <Text style={styles.tripLabel}>{translations.to}:</Text>
                  <Text style={styles.tripValue}>{data.destinationLocation}</Text>
                </View>
              )}
            </View>
            <View style={styles.tripInfoColumn}>
              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>{translations.vehicleType}:</Text>
                <Text style={styles.tripValue}>{data.vehicleTypeName}</Text>
              </View>
              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>{translations.service}:</Text>
                <Text style={styles.tripValue}>{data.serviceName}</Text>
              </View>
              <View style={styles.tripRow}>
                <Text style={styles.tripLabel}>{translations.passengers}:</Text>
                <Text style={styles.tripValue}>{data.passengers}</Text>
              </View>
            </View>
          </View>
          
          {/* Service-Specific Fields in Trip Card */}
          {data.serviceSubData && Object.keys(data.serviceSubData).length > 0 && (
            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#e2e8f0" }}>
              <Text style={[styles.tripTitle, { fontSize: 10, marginBottom: 4 }]}>Service Details</Text>
              <View style={styles.tripInfoRow}>
                {Object.entries(data.serviceSubData)
                  .filter(([key, value]) => shouldDisplayField(key, value))
                  .slice(0, 6) // Limit to 6 fields to keep compact
                  .map(([key, value]) => (
                    <View key={key} style={styles.tripInfoColumn}>
                      <View style={styles.tripRow}>
                        <Text style={styles.tripLabel}>{formatFieldLabel(key)}:</Text>
                        <Text style={styles.tripValue}>{formatFieldValue(key, value)}</Text>
                      </View>
                    </View>
                  ))}
              </View>
              {/* Show remaining fields if more than 6 */}
              {Object.entries(data.serviceSubData).filter(([key, value]) => shouldDisplayField(key, value)).length > 6 && (
                <View style={styles.tripInfoRow}>
                  {Object.entries(data.serviceSubData)
                    .filter(([key, value]) => shouldDisplayField(key, value))
                    .slice(6)
                    .map(([key, value]) => (
                      <View key={key} style={styles.tripInfoColumn}>
                        <View style={styles.tripRow}>
                          <Text style={styles.tripLabel}>{formatFieldLabel(key)}:</Text>
                          <Text style={styles.tripValue}>{formatFieldValue(key, value)}</Text>
                        </View>
                      </View>
                    ))}
                </View>
              )}
            </View>
          )}
        </View>

        {/* Two Column Layout */}
        <View style={styles.contentGrid}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Customer Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{translations.customer}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>{translations.name}:</Text>
                <Text style={styles.value}>{data.customerName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{translations.email}:</Text>
                <Text style={styles.value}>{data.customerEmail}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{translations.phone}:</Text>
                <Text style={styles.value}>{data.customerPhone}</Text>
              </View>
            </View>

            {/* Service Description - Only if it adds value */}
            {data.serviceDescription && data.serviceDescription.trim() !== "" && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{translations.service}</Text>
                <View style={styles.row}>
                  <Text style={styles.label}>{translations.description}:</Text>
                  <Text style={styles.value}>{data.serviceDescription}</Text>
                </View>
              </View>
            )}

            {/* Additional Services */}
            {(data.babySeats > 0 ||
              data.boosterSeats > 0 ||
              data.meetAndGreet) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {translations.additionalServices}
                </Text>
                {data.babySeats > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>{translations.babySeats}:</Text>
                    <Text style={styles.value}>
                      {data.babySeats} × {translations.free}
                    </Text>
                  </View>
                )}
                {data.boosterSeats > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>{translations.boosters}:</Text>
                    <Text style={styles.value}>
                      {data.boosterSeats} × {translations.free}
                    </Text>
                  </View>
                )}
                {data.meetAndGreet && (
                  <View style={styles.row}>
                    <Text style={styles.label}>
                      {translations.meetAndGreet}:
                    </Text>
                    <Text style={styles.value}>{translations.free}</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Pricing Section - Always show for all services */}
            <View style={styles.priceSection}>
              <Text style={styles.sectionTitle}>{translations.pricing}</Text>
              {shouldShowPricing ? (
                <>
                {/* Show breakdown for Disneyland return trips, otherwise show base price */}
                {isDisneyland && hasReturnTrip && finalPrice > 0 ? (
                  <>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>
                        {translations.basePrice}:
                      </Text>
                      <Text style={styles.priceValue}>
                        €{(finalPrice / 2).toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>
                        Return Trip:
                      </Text>
                      <Text style={styles.priceValue}>
                        €{(finalPrice / 2).toFixed(2)}
                      </Text>
                    </View>
                  </>
                ) : (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      {translations.basePrice}:
                    </Text>
                    <Text style={styles.priceValue}>
                      €{finalPrice.toFixed(2)}
                    </Text>
                  </View>
                )}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>{translations.total}:</Text>
                    <Text style={styles.totalValue}>
                      €{finalPrice.toFixed(2)}
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.notes}>
                  <Text style={styles.notesText}>
                    {translations.quoteMessage}
                  </Text>
                </View>
              )}
            </View>

            {/* Special Requests */}
            {data.notes && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{translations.notes}</Text>
                <View style={styles.notes}>
                  <Text style={styles.notesText}>{data.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.importantNotes}>
          <Text style={styles.importantTitle}>
            {translations.importantInformation}
          </Text>
          <Text style={styles.importantText}>
            • {translations.importantNote1}
          </Text>
          <Text style={styles.importantText}>
            • {translations.importantNote2}
          </Text>
          <Text style={styles.importantText}>
            • {translations.importantNote3}
          </Text>
          <Text style={styles.importantText}>
            • {translations.importantNote4}
          </Text>
          <Text style={styles.importantText}>
            • {translations.importantNote5}
          </Text>
          <Text style={styles.importantText}>
            • {translations.referenceNumber}: {data.reservationId}
          </Text>
          <Text style={styles.importantText}>
            • {translations.created}:{" "}
            {new Date(data.createdAt).toLocaleDateString()}
          </Text>
        </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerTitle}>
              {translations.contactInformation}
            </Text>
            <Text style={styles.footerText}>Email: info@paristransfer.com</Text>
            <Text style={styles.footerText}>Phone: +33 1 23 45 67 89</Text>
            <Text style={styles.footerText}>
              Website: www.paristransfer.com
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerTitle}>{translations.thankYou}</Text>
            <Text style={styles.footerText}>
              {translations.thankYouMessage}
            </Text>
            <Text style={styles.footerText}>
              {translations.generated}: {new Date().toLocaleString()}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default ReservationPDF;
