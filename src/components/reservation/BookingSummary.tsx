// "use client";

// import { motion } from "framer-motion";
// import { ArrowLeft, CheckCircle, Send, Shield } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { useState } from "react";
// import { Button } from "@/components/ui/Button";
// import { Card, CardContent } from "@/components/ui/Card";
// import { useCreateReservation } from "@/hooks/useReservations";
// import { useReservationStore } from "@/store/reservationStore";

// export function BookingSummary() {
//   const t = useTranslations("reservation.step3");
//   const servicesT = useTranslations("services");
//   const { formData, selectedService, selectedVehicleType, prevStep, resetForm } =
//     useReservationStore();

//   const createReservation = useCreateReservation();
//   const [isSubmitted, setIsSubmitted] = useState(false);

//   const _serviceData = selectedService ? servicesT(selectedService.name) : null;

//   const handleSubmit = async () => {
//     try {
//       if (!selectedService) {
//         console.error("Service is required");
//         return;
//       }

//       // await createReservation.mutateAsync({
//       //   ...formData,
//       //   serviceId: selectedService.id,
//       //   passengers: formData.passengers || 1,
//       //   firstName: formData.firstName || "",
//       //   lastName: formData.lastName || "",
//       //   email: formData.email || "",
//       //   phone: formData.phone || "",
//       //   pickup: formData.pickup || "",
//       //   destination: formData.destination || "",
//       //   date: formData.date || "",
//       //   time: formData.time || "",
//       // });
//       setIsSubmitted(true);
//     } catch (error) {
//       console.error("Failed to submit reservation:", error);
//     }
//   };

//   const handleBack = () => {
//     prevStep();
//   };

//   const handleNewBooking = () => {
//     resetForm();
//     setIsSubmitted(false);
//   };

//   if (isSubmitted) {
//     return (
//       <motion.div
//         className="text-center space-y-8"
//         initial={{ opacity: 0, scale: 0.9 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.6 }}
//       >
//         <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-success-500 to-emerald-500 rounded-full flex items-center justify-center success-animation">
//           <CheckCircle className="text-white text-3xl" />
//         </div>

//         <h2 className="text-3xl font-bold text-gray-900 mb-4">
//           {t("success.title")}
//         </h2>

//         <p className="text-xl text-gray-600 mb-6">{t("success.message")}</p>

//         <Card className="p-6 bg-success-50 border-success-200">
//           <CardContent>
//             <h3 className="text-lg font-bold text-success-800 mb-4">
//               {t("success.nextSteps")}
//             </h3>
//             <ul className="text-left text-success-700 space-y-2">
//               <li>📧 {t("success.emailConfirmation")}</li>
//               <li>📞 {t("success.teamContact")}</li>
//               <li>🚗 {t("success.driverAssignment")}</li>
//               <li>📱 {t("success.trackingInfo")}</li>
//             </ul>
//           </CardContent>
//         </Card>

//         <div className="flex flex-col sm:flex-row gap-4 justify-center">
//           <Button
//             variant="primary"
//             size="lg"
//             className="btn-premium"
//             onClick={() => {
//               window.location.href = "/";
//             }}
//           >
//             {t("success.backToHome")}
//           </Button>
//           <Button variant="secondary" size="lg" onClick={handleNewBooking}>
//             {t("success.newBooking")}
//           </Button>
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <div className="space-y-8">
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("title")}</h2>
//       </div>

//       {/* Booking Summary */}
//       <Card className="p-6">
//         <CardContent>
//           <h3 className="text-xl font-bold text-gray-900 mb-4">
//             {t("bookingSummary")}
//           </h3>
//           <div className="grid md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="font-bold text-gray-900 mb-2">
//                 {t("serviceDetails")}
//               </h4>
//               <p>
//                 <strong>{t("service")}:</strong>{" "}
//                 {selectedService ? servicesT(`${selectedService}.name`) : "N/A"}
//               </p>
//               <p>
//                 <strong>{t("vehicle")}:</strong>{" "}
//                 {selectedVehicleType
//                   ? selectedVehicleType.name
//                   : "Standard"}
//               </p>
//               <p>
//                 <strong>{t("pickup")}:</strong> {formData.pickup}
//               </p>
//               <p>
//                 <strong>{t("destination")}:</strong> {formData.destination}
//               </p>
//             </div>
//             <div>
//               <h4 className="font-bold text-gray-900 mb-2">
//                 {t("tripInformation")}
//               </h4>
//               <p>
//                 <strong>{t("date")}:</strong> {formData.date}
//               </p>
//               <p>
//                 <strong>{t("time")}:</strong> {formData.time}
//               </p>
//               <p>
//                 <strong>{t("passenger")}:</strong> {formData.firstName}{" "}
//                 {formData.lastName}
//               </p>
//               <p>
//                 <strong>{t("contact")}:</strong> {formData.email}
//               </p>
//             </div>
//           </div>

//           {formData.notes && (
//             <div className="mt-4">
//               <h4 className="font-bold text-gray-900 mb-2">
//                 {t("specialRequests")}
//               </h4>
//               <p>{formData.notes}</p>
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Booking Guarantee */}
//       <Card className="p-6 bg-gradient-to-r from-primary-600 to-accent-500 text-white">
//         <CardContent>
//           <h3 className="text-xl font-bold mb-4 flex items-center">
//             <Shield className="mr-2 w-6 h-6" />
//             {t("bookingGuarantee")}
//           </h3>
//           <div className="grid md:grid-cols-3 gap-4 text-sm">
//             <div className="flex items-center">
//               <CheckCircle className="mr-2 w-4 h-4" />
//               <span>{t("instantConfirmation")}</span>
//             </div>
//             <div className="flex items-center">
//               <CheckCircle className="mr-2 w-4 h-4" />
//               <span>{t("freeCancellation")}</span>
//             </div>
//             <div className="flex items-center">
//               <CheckCircle className="mr-2 w-4 h-4" />
//               <span>{t("support")}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between">
//         <Button variant="secondary" size="lg" onClick={handleBack}>
//           <ArrowLeft className="mr-3 w-5 h-5" />
//           {t("back")}
//         </Button>
//         <Button
//           variant="primary"
//           size="lg"
//           className="btn-premium"
//           onClick={handleSubmit}
//           isLoading={createReservation.isPending}
//         >
//           <Send className="mr-3 w-5 h-5" />
//           {t("confirmBooking")}
//         </Button>
//       </div>
//     </div>
//   );
// }
