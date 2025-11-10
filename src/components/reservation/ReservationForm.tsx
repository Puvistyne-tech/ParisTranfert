// "use client";

// import { zodResolver } from "@hookform/resolvers/zod";
// import { motion } from "framer-motion";
// import { Car } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { useForm } from "react-hook-form";
// import { Button } from "@/components/ui/Button";
// import { Card, CardContent } from "@/components/ui/Card";
// import { Input } from "@/components/ui/Input";
// import type { ReservationFormData } from "@/lib/validations";
// import { reservationSchema } from "@/lib/validations";
// import { useReservationStore } from "@/store/reservationStore";
// // Vehicle selection removed - using categories instead

// export function ReservationForm() {
//   const t = useTranslations("reservation.step2");
//   const {
//     selectedService,
//     selectedVehicleType,
//     updateFormData,
//     nextStep,
//     prevStep,
//   } = useReservationStore();

//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     watch,
//     setValue,
//   } = useForm<ReservationFormData>({
//     resolver: zodResolver(reservationSchema),
//     defaultValues: {
//       service: selectedService?.id || "",
//       passengers: 1,
//     },
//   });

//   const _watchedValues = watch();

//   const onSubmit = (data: ReservationFormData) => {
//     updateFormData(data);
//     nextStep();
//   };

//   const handleBack = () => {
//     prevStep();
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//       <div className="text-center">
//         <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("title")}</h2>
//       </div>

//       {/* Personal Information */}
//       <Card className="p-6">
//         <CardContent>
//           <h3 className="text-xl font-bold text-gray-900 mb-4">
//             {t("personalInfo")}
//           </h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <Input
//               label={t("firstName")}
//               {...register("firstName")}
//               error={errors.firstName?.message}
//               required
//             />
//             <Input
//               label={t("lastName")}
//               {...register("lastName")}
//               error={errors.lastName?.message}
//               required
//             />
//             <Input
//               label={t("email")}
//               type="email"
//               {...register("email")}
//               error={errors.email?.message}
//               required
//             />
//             <Input
//               label={t("phone")}
//               type="tel"
//               {...register("phone")}
//               error={errors.phone?.message}
//               required
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Trip Details */}
//       <Card className="p-6">
//         <CardContent>
//           <h3 className="text-xl font-bold text-gray-900 mb-4">
//             {t("tripDetails")}
//           </h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <Input
//               label={t("pickup")}
//               placeholder="e.g., Charles de Gaulle Airport Terminal 2"
//               {...register("pickup")}
//               error={errors.pickup?.message}
//               required
//             />
//             <Input
//               label={t("destination")}
//               placeholder="e.g., Hotel in Paris city center"
//               {...register("destination")}
//               error={errors.destination?.message}
//               required
//             />
//             <Input
//               label={t("date")}
//               type="date"
//               {...register("date")}
//               error={errors.date?.message}
//               required
//             />
//             <Input
//               label={t("time")}
//               type="time"
//               {...register("time")}
//               error={errors.time?.message}
//               required
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Vehicle Type Selection - Note: Vehicle types are selected in step 1, not here */}
//       {selectedVehicleType && (
//       <Card className="p-6">
//         <CardContent>
//           <h3 className="text-xl font-bold text-gray-900 mb-4">
//               Selected Vehicle Type
//           </h3>
//             <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
//               <p className="font-medium text-gray-900">{selectedVehicleType.name}</p>
//               {selectedVehicleType.description && (
//                 <p className="text-sm text-gray-600">{selectedVehicleType.description}</p>
//               )}
//           </div>
//         </CardContent>
//       </Card>
//       )}

//       {/* Additional Options */}
//       <Card className="p-6">
//         <CardContent>
//           <h3 className="text-xl font-bold text-gray-900 mb-4">
//             {t("additionalOptions")}
//           </h3>
//           <div className="grid md:grid-cols-2 gap-4">
//             <div className="flex items-center space-x-3">
//               <input
//                 type="checkbox"
//                 {...register("childSeat")}
//                 className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
//               />
//               <label className="text-sm font-medium text-gray-700">
//                 {t("childSeat")}
//               </label>
//             </div>
//             <div className="flex items-center space-x-3">
//               <input
//                 type="checkbox"
//                 {...register("meetGreet")}
//                 className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
//               />
//               <label className="text-sm font-medium text-gray-700">
//                 {t("meetGreet")}
//               </label>
//             </div>
//             <div className="flex items-center space-x-3">
//               <input
//                 type="checkbox"
//                 {...register("waitingTime")}
//                 className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
//               />
//               <label className="text-sm font-medium text-gray-700">
//                 {t("waitingTime")}
//               </label>
//             </div>
//             <div className="flex items-center space-x-3">
//               <input
//                 type="checkbox"
//                 {...register("flightTracking")}
//                 className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
//               />
//               <label className="text-sm font-medium text-gray-700">
//                 {t("flightTracking")}
//               </label>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Special Requests */}
//       <Card className="p-6">
//         <CardContent>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             {t("specialRequests")}
//           </label>
//           <textarea
//             {...register("notes")}
//             rows={4}
//             placeholder={t("specialRequestsPlaceholder")}
//             className="w-full p-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-300 resize-none"
//           />
//         </CardContent>
//       </Card>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between">
//         <Button
//           type="button"
//           variant="secondary"
//           size="lg"
//           onClick={handleBack}
//         >
//           {t("back")}
//         </Button>
//         <Button
//           type="submit"
//           variant="primary"
//           size="lg"
//           className="btn-premium"
//         >
//           {t("reviewConfirm")}
//         </Button>
//       </div>
//     </form>
//   );
// }
