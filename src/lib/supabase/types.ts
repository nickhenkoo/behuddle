export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    role: 'builder' | 'contributor' | null
                    full_name: string | null
                    avatar_url: string | null
                    bio: string | null
                    motivation: string | null
                    location: string | null
                    lat: number | null
                    lng: number | null
                    status: 'open' | 'busy' | 'looking_for_designer' | 'away'
                    availability_hours: number | null
                    is_open_to_match: boolean
                    is_verified: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    role?: 'builder' | 'contributor' | null
                    full_name?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    motivation?: string | null
                    location?: string | null
                    lat?: number | null
                    lng?: number | null
                    status?: 'open' | 'busy' | 'looking_for_designer' | 'away'
                    availability_hours?: number | null
                    is_open_to_match?: boolean
                    is_verified?: boolean
                }
                Update: Partial<Database['public']['Tables']['profiles']['Insert']>
            }
            skills: {
                Row: {
                    id: number
                    name: string
                    category: 'design' | 'engineering' | 'marketing' | 'business' | 'other' | null
                }
                Insert: { name: string; category?: string | null }
                Update: Partial<Database['public']['Tables']['skills']['Insert']>
            }
            profile_skills: {
                Row: {
                    profile_id: string
                    skill_id: number
                    level: 'learning' | 'mid' | 'strong'
                }
                Insert: {
                    profile_id: string
                    skill_id: number
                    level: 'learning' | 'mid' | 'strong'
                }
                Update: Partial<Database['public']['Tables']['profile_skills']['Insert']>
            }
            projects: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    description: string | null
                    stage: 'idea' | 'prototype' | 'building' | 'launched' | null
                    domain: string | null
                    what_exists: string | null
                    what_needed: string | null
                    is_active: boolean
                    is_paused: boolean
                    is_spotlight: boolean
                    spotlight_week: number | null
                    last_updated_at: string
                    created_at: string
                }
                Insert: {
                    owner_id: string
                    title: string
                    description?: string | null
                    stage?: 'idea' | 'prototype' | 'building' | 'launched' | null
                    domain?: string | null
                    what_exists?: string | null
                    what_needed?: string | null
                    is_active?: boolean
                    is_paused?: boolean
                }
                Update: Partial<Database['public']['Tables']['projects']['Insert']>
            }
            matches: {
                Row: {
                    id: string
                    profile_a: string
                    profile_b: string
                    project_id: string | null
                    score: number | null
                    spark_text: string | null
                    source: 'ai' | 'map' | 'browse' | null
                    status_a: 'pending' | 'yes' | 'no' | 'deferred'
                    status_b: 'pending' | 'yes' | 'no' | 'deferred'
                    created_at: string
                }
                Insert: {
                    profile_a: string
                    profile_b: string
                    project_id?: string | null
                    score?: number | null
                    spark_text?: string | null
                    source?: 'ai' | 'map' | 'browse' | null
                }
                Update: Partial<Database['public']['Tables']['matches']['Insert']>
            }
            conversations: {
                Row: {
                    id: string
                    match_id: string
                    context: string | null
                    created_at: string
                }
                Insert: { match_id: string; context?: string | null }
                Update: Partial<Database['public']['Tables']['conversations']['Insert']>
            }
            messages: {
                Row: {
                    id: string
                    conversation_id: string
                    sender_id: string
                    content: string
                    created_at: string
                }
                Insert: {
                    conversation_id: string
                    sender_id: string
                    content: string
                }
                Update: Partial<Database['public']['Tables']['messages']['Insert']>
            }
            posts: {
                Row: {
                    id: string
                    author_id: string
                    project_id: string | null
                    type: 'question' | 'find' | 'case' | null
                    title: string
                    body: string | null
                    upvotes: number
                    created_at: string
                }
                Insert: {
                    author_id: string
                    title: string
                    project_id?: string | null
                    type?: 'question' | 'find' | 'case' | null
                    body?: string | null
                }
                Update: Partial<Database['public']['Tables']['posts']['Insert']>
            }
            comments: {
                Row: {
                    id: string
                    post_id: string
                    author_id: string
                    body: string
                    created_at: string
                }
                Insert: { post_id: string; author_id: string; body: string }
                Update: Partial<Database['public']['Tables']['comments']['Insert']>
            }
            weekly_questions: {
                Row: {
                    id: number
                    question: string
                    week_number: number
                    year: number
                }
                Insert: { question: string; week_number: number; year: number }
                Update: Partial<Database['public']['Tables']['weekly_questions']['Insert']>
            }
            weekly_question_answers: {
                Row: {
                    profile_id: string
                    question_id: number
                    answer: string | null
                    created_at: string
                }
                Insert: { profile_id: string; question_id: number; answer?: string | null }
                Update: Partial<Database['public']['Tables']['weekly_question_answers']['Insert']>
            }
        }
        Views: {
            map_users: {
                Row: {
                    id: string
                    full_name: string | null
                    role: string | null
                    status: string
                    is_verified: boolean
                    lat: number | null
                    lng: number | null
                }
            }
        }
    }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Match = Database['public']['Tables']['matches']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Skill = Database['public']['Tables']['skills']['Row']
export type MapUser = Database['public']['Views']['map_users']['Row']