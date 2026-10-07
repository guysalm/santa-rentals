
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "affiliate_clicks": {
                  Row: {
                    "affiliate_id": string,"created_at": string,"id": number,"source": string,"visitor_hash": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "affiliate_id": string,"created_at"?: string,"id"?: never,"source"?: string,"visitor_hash"?: string | null
                  }
                  Update: {
                    "affiliate_id"?: string,"created_at"?: string,"id"?: never,"source"?: string,"visitor_hash"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "affiliate_clicks_affiliate_id_fkey"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    }
                  ]
                },"affiliates": {
                  Row: {
                    "approved_at": string | null,"area": string | null,"commission_rate": number,"created_at": string,"customer_discount": number,"email": string,"full_name": string,"id": string,"id_number": string | null,"nfc_serial": string | null,"notes": string | null,"payout_details": string | null,"payout_method": string,"phone": string,"slug": string | null,"status": Database["public"]['Enums']["affiliate_status"],"tag_fee_cents": number,"tag_fee_paid_at": string | null,"tag_fee_session_id": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_at"?: string | null,"area"?: string | null,"commission_rate"?: number,"created_at"?: string,"customer_discount"?: number,"email": string,"full_name": string,"id"?: string,"id_number"?: string | null,"nfc_serial"?: string | null,"notes"?: string | null,"payout_details"?: string | null,"payout_method"?: string,"phone": string,"slug"?: string | null,"status"?: Database["public"]['Enums']["affiliate_status"],"tag_fee_cents"?: number,"tag_fee_paid_at"?: string | null,"tag_fee_session_id"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "approved_at"?: string | null,"area"?: string | null,"commission_rate"?: number,"created_at"?: string,"customer_discount"?: number,"email"?: string,"full_name"?: string,"id"?: string,"id_number"?: string | null,"nfc_serial"?: string | null,"notes"?: string | null,"payout_details"?: string | null,"payout_method"?: string,"phone"?: string,"slug"?: string | null,"status"?: Database["public"]['Enums']["affiliate_status"],"tag_fee_cents"?: number,"tag_fee_paid_at"?: string | null,"tag_fee_session_id"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"commissions": {
                  Row: {
                    "affiliate_id": string,"amount_cents": number,"base_cents": number,"created_at": string,"earned_at": string | null,"id": string,"payout_id": string | null,"rate": number,"reservation_id": string,"status": Database["public"]['Enums']["commission_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "affiliate_id": string,"amount_cents": number,"base_cents": number,"created_at"?: string,"earned_at"?: string | null,"id"?: string,"payout_id"?: string | null,"rate": number,"reservation_id": string,"status"?: Database["public"]['Enums']["commission_status"]
                  }
                  Update: {
                    "affiliate_id"?: string,"amount_cents"?: number,"base_cents"?: number,"created_at"?: string,"earned_at"?: string | null,"id"?: string,"payout_id"?: string | null,"rate"?: number,"reservation_id"?: string,"status"?: Database["public"]['Enums']["commission_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "commissions_affiliate_id_fkey"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "commissions_payout_id_fkey"
      columns: ["payout_id"]
isOneToOne: false
      referencedRelation: "payouts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "commissions_reservation_id_fkey"
      columns: ["reservation_id"]
isOneToOne: true
      referencedRelation: "reservations"
      referencedColumns: ["id"]
    }
                  ]
                },"customers": {
                  Row: {
                    "country": string | null,"created_at": string,"email": string,"full_name": string,"id": string,"phone": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "country"?: string | null,"created_at"?: string,"email": string,"full_name": string,"id"?: string,"phone"?: string | null
                  }
                  Update: {
                    "country"?: string | null,"created_at"?: string,"email"?: string,"full_name"?: string,"id"?: string,"phone"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"maintenance_logs": {
                  Row: {
                    "cost_cents": number | null,"created_at": string,"description": string,"id": string,"odometer_km": number | null,"performed_on": string,"vehicle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "cost_cents"?: number | null,"created_at"?: string,"description": string,"id"?: string,"odometer_km"?: number | null,"performed_on"?: string,"vehicle_id": string
                  }
                  Update: {
                    "cost_cents"?: number | null,"created_at"?: string,"description"?: string,"id"?: string,"odometer_km"?: number | null,"performed_on"?: string,"vehicle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "maintenance_logs_vehicle_id_fkey"
      columns: ["vehicle_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id"]
    }
                  ]
                },"payouts": {
                  Row: {
                    "affiliate_id": string,"amount_cents": number,"created_at": string,"id": string,"paid_at": string | null,"period_end": string,"period_start": string,"reference": string | null,"status": Database["public"]['Enums']["payout_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "affiliate_id": string,"amount_cents": number,"created_at"?: string,"id"?: string,"paid_at"?: string | null,"period_end": string,"period_start": string,"reference"?: string | null,"status"?: Database["public"]['Enums']["payout_status"]
                  }
                  Update: {
                    "affiliate_id"?: string,"amount_cents"?: number,"created_at"?: string,"id"?: string,"paid_at"?: string | null,"period_end"?: string,"period_start"?: string,"reference"?: string | null,"status"?: Database["public"]['Enums']["payout_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "payouts_affiliate_id_fkey"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string | null,"id": string,"role": Database["public"]['Enums']["app_role"]
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"full_name"?: string | null,"id": string,"role"?: Database["public"]['Enums']["app_role"]
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["app_role"]
                  }
                  Relationships: [
                    
                  ]
                },"reservation_items": {
                  Row: {
                    "blocks_inventory": boolean,"id": string,"model_id": string,"period": unknown,"price_cents": number,"reservation_id": string,"vehicle_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "blocks_inventory"?: boolean,"id"?: string,"model_id": string,"period": unknown,"price_cents": number,"reservation_id": string,"vehicle_id": string
                  }
                  Update: {
                    "blocks_inventory"?: boolean,"id"?: string,"model_id"?: string,"period"?: unknown,"price_cents"?: number,"reservation_id"?: string,"vehicle_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "reservation_items_model_id_fkey"
      columns: ["model_id"]
isOneToOne: false
      referencedRelation: "vehicle_models"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reservation_items_reservation_id_fkey"
      columns: ["reservation_id"]
isOneToOne: false
      referencedRelation: "reservations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reservation_items_vehicle_id_fkey"
      columns: ["vehicle_id"]
isOneToOne: false
      referencedRelation: "vehicles"
      referencedColumns: ["id"]
    }
                  ]
                },"reservations": {
                  Row: {
                    "admin_notes": string | null,"affiliate_id": string | null,"cancel_reason": string | null,"cancellation_fee_cents": number,"cancelled_at": string | null,"checkout_session_id": string | null,"code": string,"created_at": string,"customer_id": string,"delivery_location": string | null,"deposit_cents": number,"deposit_hold_id": string | null,"discount_cents": number,"end_at": string | null,"expires_at": string | null,"id": string,"kind": Database["public"]['Enums']["reservation_kind"],"license_path": string | null,"locale": string,"manage_token": string,"notes": string | null,"paid_at": string | null,"pax": number | null,"payment_intent_id": string | null,"payment_method_id": string | null,"payment_provider": string,"provider_customer_id": string | null,"refunded_cents": number,"start_at": string | null,"status": Database["public"]['Enums']["reservation_status"],"subtotal_cents": number,"tax_cents": number,"total_cents": number,"tour_departure_id": string | null,"tour_id": string | null,"updated_at": string,"waiver_signed_at": string | null,"waiver_signed_name": string | null,"waiver_version": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string | null,"affiliate_id"?: string | null,"cancel_reason"?: string | null,"cancellation_fee_cents"?: number,"cancelled_at"?: string | null,"checkout_session_id"?: string | null,"code"?: string,"created_at"?: string,"customer_id": string,"delivery_location"?: string | null,"deposit_cents"?: number,"deposit_hold_id"?: string | null,"discount_cents"?: number,"end_at"?: string | null,"expires_at"?: string | null,"id"?: string,"kind": Database["public"]['Enums']["reservation_kind"],"license_path"?: string | null,"locale"?: string,"manage_token"?: string,"notes"?: string | null,"paid_at"?: string | null,"pax"?: number | null,"payment_intent_id"?: string | null,"payment_method_id"?: string | null,"payment_provider"?: string,"provider_customer_id"?: string | null,"refunded_cents"?: number,"start_at"?: string | null,"status"?: Database["public"]['Enums']["reservation_status"],"subtotal_cents": number,"tax_cents"?: number,"total_cents": number,"tour_departure_id"?: string | null,"tour_id"?: string | null,"updated_at"?: string,"waiver_signed_at"?: string | null,"waiver_signed_name"?: string | null,"waiver_version"?: string | null
                  }
                  Update: {
                    "admin_notes"?: string | null,"affiliate_id"?: string | null,"cancel_reason"?: string | null,"cancellation_fee_cents"?: number,"cancelled_at"?: string | null,"checkout_session_id"?: string | null,"code"?: string,"created_at"?: string,"customer_id"?: string,"delivery_location"?: string | null,"deposit_cents"?: number,"deposit_hold_id"?: string | null,"discount_cents"?: number,"end_at"?: string | null,"expires_at"?: string | null,"id"?: string,"kind"?: Database["public"]['Enums']["reservation_kind"],"license_path"?: string | null,"locale"?: string,"manage_token"?: string,"notes"?: string | null,"paid_at"?: string | null,"pax"?: number | null,"payment_intent_id"?: string | null,"payment_method_id"?: string | null,"payment_provider"?: string,"provider_customer_id"?: string | null,"refunded_cents"?: number,"start_at"?: string | null,"status"?: Database["public"]['Enums']["reservation_status"],"subtotal_cents"?: number,"tax_cents"?: number,"total_cents"?: number,"tour_departure_id"?: string | null,"tour_id"?: string | null,"updated_at"?: string,"waiver_signed_at"?: string | null,"waiver_signed_name"?: string | null,"waiver_version"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "reservations_affiliate_id_fkey"
      columns: ["affiliate_id"]
isOneToOne: false
      referencedRelation: "affiliates"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reservations_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customers"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reservations_tour_departure_id_fkey"
      columns: ["tour_departure_id"]
isOneToOne: false
      referencedRelation: "tour_departures"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reservations_tour_id_fkey"
      columns: ["tour_id"]
isOneToOne: false
      referencedRelation: "tours"
      referencedColumns: ["id"]
    }
                  ]
                },"seasons": {
                  Row: {
                    "end_date": string,"id": string,"multiplier": number,"name": string,"start_date": string
                  }
                  ComputedFields: never
                  Insert: {
                    "end_date": string,"id"?: string,"multiplier"?: number,"name": string,"start_date": string
                  }
                  Update: {
                    "end_date"?: string,"id"?: string,"multiplier"?: number,"name"?: string,"start_date"?: string
                  }
                  Relationships: [
                    
                  ]
                },"settings": {
                  Row: {
                    "key": string,"updated_at": string,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "key": string,"updated_at"?: string,"value": NonNullable<Json>
                  }
                  Update: {
                    "key"?: string,"updated_at"?: string,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"tour_departures": {
                  Row: {
                    "capacity": number,"closed": boolean,"departs_on": string,"id": string,"tour_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "capacity": number,"closed"?: boolean,"departs_on": string,"id"?: string,"tour_id": string
                  }
                  Update: {
                    "capacity"?: number,"closed"?: boolean,"departs_on"?: string,"id"?: string,"tour_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tour_departures_tour_id_fkey"
      columns: ["tour_id"]
isOneToOne: false
      referencedRelation: "tours"
      referencedColumns: ["id"]
    }
                  ]
                },"tours": {
                  Row: {
                    "active": boolean,"category": Database["public"]['Enums']["tour_category"],"content": NonNullable<Json>,"created_at": string,"days_of_week": (number)[],"difficulty": number,"duration_hours": number,"id": string,"images": (string)[],"max_pax": number,"min_pax": number,"overnight": boolean,"price_cents": number,"slug": string,"sort": number,"start_time": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"category": Database["public"]['Enums']["tour_category"],"content"?: NonNullable<Json>,"created_at"?: string,"days_of_week"?: (number)[],"difficulty"?: number,"duration_hours": number,"id"?: string,"images"?: (string)[],"max_pax"?: number,"min_pax"?: number,"overnight"?: boolean,"price_cents": number,"slug": string,"sort"?: number,"start_time"?: string,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"category"?: Database["public"]['Enums']["tour_category"],"content"?: NonNullable<Json>,"created_at"?: string,"days_of_week"?: (number)[],"difficulty"?: number,"duration_hours"?: number,"id"?: string,"images"?: (string)[],"max_pax"?: number,"min_pax"?: number,"overnight"?: boolean,"price_cents"?: number,"slug"?: string,"sort"?: number,"start_time"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"vehicle_models": {
                  Row: {
                    "active": boolean,"brand": string,"content": NonNullable<Json>,"created_at": string,"deposit_cents": number,"engine_cc": number | null,"id": string,"images": (string)[],"min_age": number,"name": string,"price_8h_cents": number,"price_day_cents": number,"price_week_cents": number | null,"seats": number,"slug": string,"sort": number,"specs": NonNullable<Json>,"transmission": string | null,"type": Database["public"]['Enums']["vehicle_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"brand": string,"content"?: NonNullable<Json>,"created_at"?: string,"deposit_cents"?: number,"engine_cc"?: number | null,"id"?: string,"images"?: (string)[],"min_age"?: number,"name": string,"price_8h_cents": number,"price_day_cents": number,"price_week_cents"?: number | null,"seats"?: number,"slug": string,"sort"?: number,"specs"?: NonNullable<Json>,"transmission"?: string | null,"type": Database["public"]['Enums']["vehicle_type"],"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"brand"?: string,"content"?: NonNullable<Json>,"created_at"?: string,"deposit_cents"?: number,"engine_cc"?: number | null,"id"?: string,"images"?: (string)[],"min_age"?: number,"name"?: string,"price_8h_cents"?: number,"price_day_cents"?: number,"price_week_cents"?: number | null,"seats"?: number,"slug"?: string,"sort"?: number,"specs"?: NonNullable<Json>,"transmission"?: string | null,"type"?: Database["public"]['Enums']["vehicle_type"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"vehicles": {
                  Row: {
                    "color": string | null,"created_at": string,"id": string,"label": string,"model_id": string,"notes": string | null,"odometer_km": number | null,"plate": string | null,"status": Database["public"]['Enums']["vehicle_status"],"vin": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "color"?: string | null,"created_at"?: string,"id"?: string,"label": string,"model_id": string,"notes"?: string | null,"odometer_km"?: number | null,"plate"?: string | null,"status"?: Database["public"]['Enums']["vehicle_status"],"vin"?: string | null
                  }
                  Update: {
                    "color"?: string | null,"created_at"?: string,"id"?: string,"label"?: string,"model_id"?: string,"notes"?: string | null,"odometer_km"?: number | null,"plate"?: string | null,"status"?: Database["public"]['Enums']["vehicle_status"],"vin"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "vehicles_model_id_fkey"
      columns: ["model_id"]
isOneToOne: false
      referencedRelation: "vehicle_models"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "affiliate_balance":
{ Args: { "p_affiliate": string }; Returns: {
              "earned_cents": number,"paid_cents": number,"pending_cents": number
            }[]
                           },
"available_units":
{ Args: { "p_model": string,"p_period": unknown }; Returns: number
                           },
"expire_stale_holds":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"has_role":
{ Args: { "roles": (Database["public"]['Enums']["app_role"])[] }; Returns: boolean
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"pick_vehicle":
{ Args: { "p_model": string,"p_period": unknown }; Returns: string
                           },
"tour_seats_taken":
{ Args: { "p_departure": string }; Returns: number
                           }
          }
          Enums: {
            "affiliate_status": "pending"|"approved"|"suspended","app_role": "admin"|"staff"|"agent","commission_status": "pending"|"earned"|"paid"|"void","payout_status": "pending"|"paid","reservation_kind": "rental"|"tour","reservation_status": "pending_payment"|"paid"|"active"|"completed"|"cancelled"|"no_show"|"expired","tour_category": "atv-tour"|"dirt-bike-tour"|"camping"|"day-tour","vehicle_status": "available"|"maintenance"|"retired","vehicle_type": "atv"|"dirtbike"|"scooter"|"utv"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "affiliate_status": ["pending", "approved", "suspended"],"app_role": ["admin", "staff", "agent"],"commission_status": ["pending", "earned", "paid", "void"],"payout_status": ["pending", "paid"],"reservation_kind": ["rental", "tour"],"reservation_status": ["pending_payment", "paid", "active", "completed", "cancelled", "no_show", "expired"],"tour_category": ["atv-tour", "dirt-bike-tour", "camping", "day-tour"],"vehicle_status": ["available", "maintenance", "retired"],"vehicle_type": ["atv", "dirtbike", "scooter", "utv"]
          }
        }
} as const
