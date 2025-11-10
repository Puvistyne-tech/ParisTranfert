"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle, XCircle, Send, Edit, User, Calendar, MapPin, Car, DollarSign, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "./StatusBadge";
import type { Reservation, ReservationStatus } from "@/components/models/reservations";
import { updateReservation, updateReservationStatus } from "@/lib/supabaseService";
import { getClientById } from "@/lib/supabaseService";
import type { Client } from "@/components/models/clients";

interface ReservationDetailModalProps {
  reservation: Reservation;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export function ReservationDetailModal({
  reservation,
  isOpen,
  onClose,
  onUpdate,
}: ReservationDetailModalProps) {
  const [activeTab, setActiveTab] = useState<"details" | "client" | "trip" | "pricing" | "notes">("details");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<Client | null>(null);
  const [adminNotes, setAdminNotes] = useState(reservation.notes || "");
  const [editedPrice, setEditedPrice] = useState(reservation.totalPrice.toString());

  const [editedData, setEditedData] = useState({
    date: reservation.date,
    time: reservation.time,
    pickupLocation: reservation.pickupLocation,
    destinationLocation: reservation.destinationLocation || "",
    passengers: reservation.passengers,
    babySeats: reservation.babySeats,
    boosterSeats: reservation.boosterSeats,
    meetAndGreet: reservation.meetAndGreet,
    notes: reservation.notes || "",
    totalPrice: reservation.totalPrice,
  });

  useEffect(() => {
    if (isOpen && reservation.clientId) {
      getClientById(reservation.clientId).then(setClient).catch(console.error);
    }
  }, [isOpen, reservation.clientId]);

  const handleAcceptQuote = async () => {
    setLoading(true);
    try {
      await updateReservationStatus(reservation.id, "quote_accepted" as ReservationStatus);
      await updateReservationStatus(reservation.id, "confirmed" as ReservationStatus);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error accepting quote:", error);
      alert("Failed to accept quote");
    } finally {
      setLoading(false);
    }
  };

  const handleDeclineQuote = async () => {
    setLoading(true);
    try {
      await updateReservationStatus(reservation.id, "cancelled" as ReservationStatus);
      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error declining quote:", error);
      alert("Failed to decline quote");
    } finally {
      setLoading(false);
    }
  };

  const handleModifyQuote = async () => {
    setLoading(true);
    try {
      await updateReservation(reservation.id, {
        ...editedData,
        totalPrice: parseFloat(editedPrice),
        notes: adminNotes,
      });
      onUpdate();
      setIsEditing(false);
    } catch (error) {
      console.error("Error modifying quote:", error);
      alert("Failed to modify quote");
    } finally {
      setLoading(false);
    }
  };

  const handleSendQuote = async () => {
    setLoading(true);
    try {
      await updateReservationStatus(reservation.id, "quote_sent" as ReservationStatus);
      onUpdate();
      alert("Quote sent to customer");
    } catch (error) {
      console.error("Error sending quote:", error);
      alert("Failed to send quote");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isQuote = ["pending", "quote_sent", "quote_accepted"].includes(reservation.status);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Reservation Details</h2>
            <p className="text-sm text-gray-500 mt-1">ID: {reservation.id}</p>
          </div>
          <div className="flex items-center space-x-3">
            <StatusBadge status={reservation.status as any} />
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-1">
            {[
              { id: "details", label: "Details" },
              { id: "client", label: "Client Info" },
              { id: "trip", label: "Trip Details" },
              { id: "pricing", label: "Pricing" },
              { id: "notes", label: "Notes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary-600 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "details" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Service ID</label>
                  <p className="text-gray-900">{reservation.serviceId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Vehicle Type</label>
                  <p className="text-gray-900">{reservation.vehicleTypeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <StatusBadge status={reservation.status as any} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Price</label>
                  <p className="text-gray-900">€{reservation.totalPrice}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "client" && (
            <div className="space-y-4">
              {client ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <p className="text-gray-900">{client.firstName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <p className="text-gray-900">{client.lastName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      <p className="text-gray-900">{client.email}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{client.phone}</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Loading client information...</p>
              )}
            </div>
          )}

          {activeTab === "trip" && (
            <div className="space-y-4">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Date</label>
                      <Input
                        type="date"
                        value={editedData.date}
                        onChange={(e) => setEditedData({ ...editedData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Time</label>
                      <Input
                        type="time"
                        value={editedData.time}
                        onChange={(e) => setEditedData({ ...editedData, time: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Pickup Location</label>
                      <Input
                        value={editedData.pickupLocation}
                        onChange={(e) => setEditedData({ ...editedData, pickupLocation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Destination</label>
                      <Input
                        value={editedData.destinationLocation}
                        onChange={(e) => setEditedData({ ...editedData, destinationLocation: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Passengers</label>
                      <Input
                        type="number"
                        value={editedData.passengers}
                        onChange={(e) => setEditedData({ ...editedData, passengers: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Date</label>
                    <p className="text-gray-900">{reservation.date}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Time</label>
                    <p className="text-gray-900">{reservation.time}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Pickup Location</label>
                    <p className="text-gray-900">{reservation.pickupLocation}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Destination</label>
                    <p className="text-gray-900">{reservation.destinationLocation || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Passengers</label>
                    <p className="text-gray-900">{reservation.passengers}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "pricing" && (
            <div className="space-y-4">
              {isEditing ? (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Total Price (€)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={editedPrice}
                    onChange={(e) => setEditedPrice(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium text-gray-700">Total Price</label>
                  <p className="text-2xl font-bold text-gray-900">€{reservation.totalPrice}</p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Baby Seats</label>
                  <p className="text-gray-900">{reservation.babySeats} × €15 = €{reservation.babySeats * 15}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Booster Seats</label>
                  <p className="text-gray-900">{reservation.boosterSeats} × €10 = €{reservation.boosterSeats * 10}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Meet & Greet</label>
                  <p className="text-gray-900">{reservation.meetAndGreet ? "€25" : "€0"}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Customer Notes</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{reservation.notes || "No notes"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Admin Notes</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={4}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add admin notes here..."
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            {!isEditing && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {isEditing && (
              <Button
                variant="primary"
                onClick={handleModifyQuote}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isQuote && !isEditing && (
              <>
                {reservation.status === "pending" && (
                  <Button
                    variant="secondary"
                    onClick={handleSendQuote}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send Quote
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={handleAcceptQuote}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept Quote
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleDeclineQuote}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Decline Quote
                </Button>
              </>
            )}
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

