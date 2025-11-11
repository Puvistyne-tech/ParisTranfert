// "use client";

// import { useState, useEffect } from "react";
// import { Card, CardContent } from "@/components/ui/Card";
// import { Input } from "@/components/ui/Input";
// import { Select } from "@/components/ui/Select";
// import { Service } from "@/components/models";
// import { getLocationsByService } from "@/lib/supabaseService";
// import type { Location } from "@/components/models/locations";
// import {
//   Plane,
//   Calendar,
//   MapPin,
//   Users,
//   Shield,
//   FileText,
//   Globe,
//   Clock,
//   Heart,
//   Star,
//   UserCheck
// } from "lucide-react";

// interface ServiceSubOptionsProps {
//   service: Service;
//   onDataChange: (data: Record<string, any>) => void;
// }

// interface ServiceField {
//   type: 'text' | 'number' | 'select' | 'textarea' | 'date' | 'time' | 'location_select';
//   label: string;
//   required: boolean;
//   options?: string[];
//   min?: number;
//   max?: number;
//   is_pickup?: boolean;
//   is_destination?: boolean;
// }

// const fieldIcons: Record<string, any> = {
//   'pickup_location': MapPin,
//   'destination_location': MapPin,
//   'flight_number': Plane,
//   'flight_date': Calendar,
//   'flight_time': Clock,
//   'terminal': Plane,
//   'passenger_count': Users,
//   'duration': Clock,
//   'pickup_location_text': MapPin,
// };

// export function ServiceSubOptions({ service, onDataChange }: ServiceSubOptionsProps) {
//   const [formData, setFormData] = useState<Record<string, any>>({});
//   const [locations, setLocations] = useState<Location[]>([]);
//   const [loadingLocations, setLoadingLocations] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Load locations if service has location_select fields
//   useEffect(() => {
//     async function loadLocations() {
//       if (!service.serviceFields) return;

//       const fields = service.serviceFields as unknown as Record<string, ServiceField>;
//       const hasLocationSelect = Object.values(fields).some(
//         (field) => field.type === 'location_select'
//       );

//       if (hasLocationSelect) {
//         setLoadingLocations(true);
//         try {
//           const serviceLocations = await getLocationsByService(service.id);
//           setLocations(serviceLocations);
//         } catch (error) {
//           console.error('Error loading locations:', error);
//         } finally {
//           setLoadingLocations(false);
//         }
//       }
//     }
//     loadLocations();
//   }, [service.id, service.serviceFields]);

//   const handleInputChange = (fieldKey: string, value: any) => {
//     const newData = { ...formData, [fieldKey]: value };
//     setFormData(newData);

//     // Clear error for this field
//     if (errors[fieldKey]) {
//       const newErrors = { ...errors };
//       delete newErrors[fieldKey];
//       setErrors(newErrors);
//     }

//     onDataChange(newData);
//   };

//   const validateField = (fieldKey: string, field: ServiceField, value: any): string | null => {
//     if (field.required && (!value || value === '')) {
//       return `${field.label} is required`;
//     }
//     if (field.type === 'number' && value) {
//       const numValue = Number(value);
//       if (field.min !== undefined && numValue < field.min) {
//         return `${field.label} must be at least ${field.min}`;
//       }
//       if (field.max !== undefined && numValue > field.max) {
//         return `${field.label} must be at most ${field.max}`;
//       }
//     }
//     return null;
//   };

//   const renderInput = (fieldKey: string, field: ServiceField) => {
//     const Icon = fieldIcons[fieldKey] || FileText;
//     const error = errors[fieldKey];
//     const value = formData[fieldKey] || '';

//     const commonProps = {
//       value: value,
//       onChange: (e: any) => {
//         const newValue = e.target.value;
//         handleInputChange(fieldKey, newValue);
//         // Validate on change
//         const validationError = validateField(fieldKey, field, newValue);
//         if (validationError) {
//           setErrors({ ...errors, [fieldKey]: validationError });
//         }
//       },
//       placeholder: `Enter ${field.label.toLowerCase()}`,
//     };

//     switch (field.type) {
//       case 'location_select':
//         const locationOptions = locations.map(loc => ({
//           value: loc.id,
//           label: loc.name
//         }));

//         // Filter by pickup/destination if specified
//         let filteredLocations = locationOptions;
//         if (field.is_pickup) {
//           // For pickup, show all locations that can be pickup points
//           filteredLocations = locationOptions;
//         } else if (field.is_destination) {
//           // For destination, show all locations that can be destinations
//           filteredLocations = locationOptions;
//         }

//         return (
//           <div>
//             <Select
//               {...commonProps}
//               options={loadingLocations ? [{ value: '', label: 'Loading...' }] : filteredLocations}
//               disabled={loadingLocations}
//             />
//             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//           </div>
//         );

//       case 'number':
//         return (
//           <div>
//             <Input
//               {...commonProps}
//               type="number"
//               min={field.min || 1}
//               max={field.max || 20}
//             />
//             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//           </div>
//         );

//       case 'select':
//         const selectOptions = (field.options || []).map(opt => ({
//           value: opt,
//           label: opt
//         }));
//         return (
//           <div>
//             <Select
//               {...commonProps}
//               options={selectOptions}
//             />
//             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//           </div>
//         );

//       case 'textarea':
//         return (
//           <div>
//             <textarea
//               {...commonProps}
//               rows={3}
//               className={`w-full p-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors ${
//                 error ? 'border-red-500' : 'border-gray-300'
//               }`}
//             />
//             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//           </div>
//         );

//       case 'date':
//         return (
//           <div>
//             <Input
//               {...commonProps}
//               type="date"
//             />
//             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//           </div>
//         );

//       case 'time':
//         return (
//           <div>
//             <Input
//               {...commonProps}
//               type="time"
//             />
//             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//           </div>
//         );

//       default:
//         return (
//           <div>
//             <Input
//               {...commonProps}
//               type="text"
//               className={error ? 'border-red-500' : ''}
//             />
//             {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
//           </div>
//         );
//     }
//   };

//   // Use serviceFields if available, otherwise fall back to requirements
//   const serviceFields = service.serviceFields
//     ? (service.serviceFields as unknown as Record<string, ServiceField>)
//     : undefined;

//   if (!serviceFields || Object.keys(serviceFields).length === 0) {
//     return null;
//   }

//   return (
//     <Card className="mt-6">
//       <CardContent className="p-6">
//         <h3 className="text-lg font-semibold text-gray-900 mb-4">
//           Service Details
//         </h3>
//         <p className="text-sm text-gray-600 mb-6">
//           Please provide the following information for your {service.name} service:
//         </p>

//         <div className="grid md:grid-cols-2 gap-6">
//           {Object.entries(serviceFields).map(([fieldKey, field]) => {
//             const Icon = fieldIcons[fieldKey] || FileText;
//             return (
//               <div key={fieldKey} className="space-y-2">
//                 <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
//                   <Icon className="w-4 h-4 text-blue-600" />
//                   <span>
//                     {field.label}
//                     {field.required && <span className="text-red-500 ml-1">*</span>}
//                   </span>
//                 </label>
//                 {renderInput(fieldKey, field)}
//               </div>
//             );
//           })}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
