export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    email: string
                    role: 'parent' | 'monitor' | 'admin'
                    push_token: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role: 'parent' | 'monitor' | 'admin'
                    push_token?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'parent' | 'monitor' | 'admin'
                    push_token?: string | null
                    created_at?: string
                }
            }
            classes: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    age_range: string | null
                    weekly_schedule: Json | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    age_range?: string | null
                    weekly_schedule?: Json | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    age_range?: string | null
                    weekly_schedule?: Json | null
                    created_at?: string
                }
            }
            children: {
                Row: {
                    id: string
                    name: string
                    photo_url: string | null
                    class_id: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    photo_url?: string | null
                    class_id?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    photo_url?: string | null
                    class_id?: string | null
                    created_at?: string
                }
            }
            guardians: {
                Row: {
                    id: string
                    user_id: string
                    image_consent: boolean
                    image_consent_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    image_consent?: boolean
                    image_consent_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    image_consent?: boolean
                    image_consent_at?: string | null
                    created_at?: string
                }
            }
            guardian_children: {
                Row: {
                    guardian_id: string
                    child_id: string
                }
                Insert: {
                    guardian_id: string
                    child_id: string
                }
                Update: {
                    guardian_id?: string
                    child_id?: string
                }
            }
            monitor_activities: {
                Row: {
                    monitor_id: string
                    class_id: string
                    is_primary: boolean
                }
                Insert: {
                    monitor_id: string
                    class_id: string
                    is_primary?: boolean
                }
                Update: {
                    monitor_id?: string
                    class_id?: string
                    is_primary?: boolean
                }
            }
            attendance_records: {
                Row: {
                    id: string
                    child_id: string
                    class_id: string
                    monitor_id: string
                    date: string
                    status: 'present' | 'absent' | 'pre_justified' | 'justified'
                    lat: number | null
                    lng: number | null
                    justification_note: string | null
                    justified_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    child_id: string
                    class_id: string
                    monitor_id: string
                    date: string
                    status: 'present' | 'absent' | 'pre_justified' | 'justified'
                    lat?: number | null
                    lng?: number | null
                    justification_note?: string | null
                    justified_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    child_id?: string
                    class_id?: string
                    monitor_id?: string
                    date?: string
                    status?: 'present' | 'absent' | 'pre_justified' | 'justified'
                    lat?: number | null
                    lng?: number | null
                    justification_note?: string | null
                    justified_at?: string | null
                    created_at?: string
                }
            }
        }
    }
}
