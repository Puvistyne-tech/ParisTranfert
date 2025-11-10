// "use client";

// import { motion } from "framer-motion";
// import Image from "next/image";
// import { Leaf, Users, Zap } from "lucide-react";
// import { useTranslations } from "next-intl";
// import { Card, CardContent } from "@/components/ui/Card";

// import { useState } from "react";
// import { VEHICLE_CLASSES, VehicleClassTypes } from "../models";
// import { getRandomGradient, Vehicle } from "../models/vehicles";
// import { getVehicleTypes } from "@/lib/supabaseService";

// export async function Fleet() {
//   const t = useTranslations("fleet");
//   const [selectedCategory, setSelectedCategory] = useState<VehicleClassTypes | 'all'>('all');

//   const getDisplayVehicles = async (): Promise<Vehicle[]> => {
//     const vehicles = await getVehiclesByCategory(selectedCategory as VehicleClassTypes);
//     return vehicles || [];
//   };

//   const displayVehicles: Vehicle[] = await getDisplayVehicles();

//   return (
//     <section
//       id="fleet"
//       className="py-20 bg-gradient-to-br from-gray-50 to-white"
//     >
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Section Header */}
//         <motion.div
//           className="text-center mb-16"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           viewport={{ once: true }}
//         >
//           <h2 className="text-4xl lg:text-6xl font-bold font-display text-gray-900 mb-6">
//             Our <span className="gradient-text">Premium Fleet</span>
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
//             {t("subtitle")}
//           </p>
//         </motion.div>

//         {/* Category Filter */}
//         <div className="flex flex-wrap justify-center gap-4 mb-12">
//           <button
//             onClick={() => setSelectedCategory('all')}
//             className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
//               selectedCategory === 'all'
//                 ? 'bg-gradient-to-r from-primary-600 to-accent-500 text-white'
//                 : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//             }`}
//           >
//             All Vehicles
//           </button>
//           {VEHICLE_CLASSES.map((category: VehicleClassTypes) => (
//             <button
//               key={category}
//               onClick={() => setSelectedCategory(category)}
//               className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
//                 selectedCategory === category
//                   ? `bg-gradient-to-r ${getRandomGradient()} text-white`
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
//               }`}
//             >
//               {category}
//             </button>
//           ))}
//         </div>

//         {/* Fleet Showcase */}
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//           {displayVehicles.map((vehicle: Vehicle, index: number) => {
//             return (
//               <motion.div
//                 key={vehicle.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 whileInView={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: index * 0.1 }}
//                 viewport={{ once: true }}
//               >
//                 <Card className="p-6 shadow-lg card-hover h-full flex flex-col">
//                   <CardContent className="text-center flex flex-col h-full">
//                     {/* Vehicle Image */}
//                     <div className="w-full h-48 mx-auto mb-4 rounded-xl overflow-hidden group-hover:scale-105 transition-all duration-300 relative">
//                       <Image
//                         src={vehicle.image || '/placeholder-car.jpg'}
//                         alt={vehicle.name}
//                         fill
//                         className="object-cover"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
//                       {/* Stylish Name Overlay */}
//                       <div className="absolute bottom-2 left-2 right-2">
//                         <div
//                           className={`bg-gradient-to-r ${vehicle.gradient} text-white px-2 py-1 rounded text-xs font-semibold`}
//                         >
//                           {vehicle.name}
//                         </div>
//                       </div>
                      
//                       {/* Electric/Hybrid Indicator on Image */}
//                       {vehicle.isElectric && (
//                         <div className="absolute top-3 right-3 bg-green-500 text-white p-2 rounded-full shadow-lg">
//                           <Leaf className="w-4 h-4" />
//                         </div>
//                       )}
//                       {vehicle.isHybrid && (
//                         <div className="absolute top-3 right-3 bg-blue-500 text-white p-2 rounded-full shadow-lg">
//                           <Zap className="w-4 h-4" />
//                         </div>
//                       )}
//                     </div>

//                     {/* Vehicle Name */}
//                     <h3 className="text-xl font-bold text-gray-900 mb-2">
//                       {vehicle.name}
//                     </h3>

//                     {/* Vehicle Description */}
//                     <p className="text-sm text-gray-600 mb-4 flex-1">
//                       {vehicle.description}
//                     </p>

//                     {/* Passenger Count - Centered */}
//                     <div className="flex justify-center mb-4">
//                       <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-full">
//                         <Users className="w-4 h-4 text-gray-600" />
//                         <span className="text-sm font-semibold text-gray-700">
//                           {vehicle.passengers}-{vehicle.maxPassengers} passengers
//                         </span>
//                       </div>
//                     </div>

//                     {/* Features - Left Aligned */}
//                     <div className="text-left space-y-1 text-xs text-gray-500 mt-auto">
//                       <div className="font-semibold text-gray-700 mb-2">Features:</div>
//                       {vehicle.features?.map((feature: string, featureIndex: number) => (
//                         <div key={featureIndex} className="flex items-center">
//                           <span className="text-green-500 mr-2">✓</span>
//                           <span>{feature}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </CardContent>
//                 </Card>
//               </motion.div>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }
