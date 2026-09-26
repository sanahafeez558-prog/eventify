"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Image as ImageIcon,
  Tag,
  Loader2,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { eventSchema, type EventFormValues } from "@/lib/validations/event";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
  slug?: string;
}

interface EventFormProps {
  categories: Category[];
  initialData?: {
    id?: string;
    title: string;
    description: string;
    category_id: string | null;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    max_attendees: number;
    image_url: string | null;
    status: "draft" | "published" | "cancelled" | "completed";
  };
  mode: "create" | "edit";
  eventId?: string;
}

const PRESET_IMAGES = [
  {
    label: "Tech & Innovation",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Business & Leadership",
    url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Networking & Community",
    url: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Workshop & Education",
    url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Entertainment & Arts",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Sports & Fitness",
    url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1200&auto=format&fit=crop&q=80",
  },
];

export function EventForm({
  categories,
  initialData,
  mode,
  eventId,
}: EventFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [submitting, setSubmitting] = React.useState(false);

  // Format today's date in YYYY-MM-DD for min date
  const today = new Date().toISOString().split("T")[0];

  // Default times: start at 10:00, end at 12:00
  const defaultStartTime = initialData?.start_time
    ? initialData.start_time.slice(0, 5)
    : "10:00";
  const defaultEndTime = initialData?.end_time
    ? initialData.end_time.slice(0, 5)
    : "12:00";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      category_id: initialData?.category_id ?? categories[0]?.id ?? "",
      event_date: initialData?.event_date ?? today,
      start_time: defaultStartTime,
      end_time: defaultEndTime,
      location: initialData?.location ?? "",
      max_attendees: initialData?.max_attendees ?? 50,
      image_url:
        initialData?.image_url ??
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80",
      status: initialData?.status ?? "published",
    },
  });

  const watchedImageUrl = watch("image_url");
  const watchedTitle = watch("title");
  const watchedDate = watch("event_date");
  const watchedLocation = watch("location");
  const watchedCategory = watch("category_id");
  const selectedCategoryObj = categories.find((c) => c.id === watchedCategory);

  const onSubmit = async (values: EventFormValues) => {
    try {
      setSubmitting(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("You must be signed in to manage events.");
        router.push("/login?redirect=/dashboard/create-event");
        return;
      }

      const payload = {
        title: values.title,
        description: values.description,
        category_id: values.category_id,
        event_date: values.event_date,
        start_time: values.start_time,
        end_time: values.end_time,
        location: values.location,
        max_attendees: Number(values.max_attendees),
        image_url: values.image_url || null,
        status: values.status,
      };

      if (mode === "create") {
        const { data, error } = await supabase
          .from("events")
          .insert({
            ...payload,
            organizer_id: user.id,
          })
          .select("id")
          .single();

        if (error) {
          throw error;
        }

        toast.success("Event created successfully! Your event is now live.");
        router.push("/dashboard/manage-events");
        router.refresh();
      } else {
        if (!eventId) throw new Error("Missing event ID for update");

        const { error } = await supabase
          .from("events")
          .update(payload)
          .eq("id", eventId)
          .eq("organizer_id", user.id);

        if (error) {
          throw error;
        }

        toast.success("Event updated successfully!");
        router.push("/dashboard/manage-events");
        router.refresh();
      }
    } catch (err: unknown) {
      console.error("Error saving event:", err);
      const message =
        err instanceof Error ? err.message : "Failed to save event. Please check inputs.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/manage-events"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Hosted Events
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Form (2 columns) */}
        <div className="lg:col-span-2">
          <Card className="glass-panel border-border shadow-soft">
            <CardContent className="p-6 md:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Event Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-semibold text-foreground mb-1.5"
                  >
                    Event Title <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="title"
                    placeholder="e.g. NextGen Web Summit 2026"
                    {...register("title")}
                    className={errors.title ? "border-destructive focus-visible:ring-destructive/30" : ""}
                  />
                  {errors.title && (
                    <p className="mt-1.5 text-xs text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="category_id"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Category <span className="text-destructive">*</span>
                    </label>
                    <Select
                      id="category_id"
                      {...register("category_id")}
                      className={errors.category_id ? "border-destructive" : ""}
                    >
                      <option value="" disabled>
                        Select a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                    {errors.category_id && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.category_id.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Publishing Status
                    </label>
                    <Select id="status" {...register("status")}>
                      <option value="published">Published (Visible to all)</option>
                      <option value="draft">Draft (Private)</option>
                      {mode === "edit" && (
                        <>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </>
                      )}
                    </Select>
                  </div>
                </div>

                {/* Date and Times */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="event_date"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="event_date"
                      type="date"
                      min={today}
                      {...register("event_date")}
                      className={errors.event_date ? "border-destructive" : ""}
                    />
                    {errors.event_date && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.event_date.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="start_time"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Start Time <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="start_time"
                      type="time"
                      {...register("start_time")}
                      className={errors.start_time ? "border-destructive" : ""}
                    />
                    {errors.start_time && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.start_time.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="end_time"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      End Time <span className="text-destructive">*</span>
                    </label>
                    <Input
                      id="end_time"
                      type="time"
                      {...register("end_time")}
                      className={errors.end_time ? "border-destructive" : ""}
                    />
                    {errors.end_time && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.end_time.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location & Capacity */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="location"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Location / Venue <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="location"
                        placeholder="e.g. Metropolitan Hall / Online Zoom"
                        {...register("location")}
                        className={errors.location ? "border-destructive pl-10" : "pl-10"}
                      />
                      <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                    {errors.location && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.location.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="max_attendees"
                      className="block text-sm font-semibold text-foreground mb-1.5"
                    >
                      Max Capacity <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="max_attendees"
                        type="number"
                        min={1}
                        max={10000}
                        placeholder="100"
                        {...register("max_attendees", { valueAsNumber: true })}
                        className={errors.max_attendees ? "border-destructive pl-10" : "pl-10"}
                      />
                      <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                    {errors.max_attendees && (
                      <p className="mt-1.5 text-xs text-destructive">
                        {errors.max_attendees.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-semibold text-foreground mb-1.5"
                  >
                    Event Description <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder="Provide a comprehensive breakdown of the agenda, speakers, who should attend, and any prerequisites..."
                    {...register("description")}
                    className={errors.description ? "border-destructive" : ""}
                  />
                  {errors.description && (
                    <p className="mt-1.5 text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Cover Image URL & Presets */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="image_url"
                      className="block text-sm font-semibold text-foreground"
                    >
                      Cover Image URL
                    </label>
                    <span className="text-xs text-muted-foreground">
                      Pick a preset or paste custom URL
                    </span>
                  </div>
                  <div className="relative mb-3">
                    <Input
                      id="image_url"
                      placeholder="https://images.unsplash.com/..."
                      {...register("image_url")}
                      className={errors.image_url ? "border-destructive pl-10" : "pl-10"}
                    />
                    <ImageIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  {errors.image_url && (
                    <p className="mt-1.5 text-xs text-destructive mb-2">
                      {errors.image_url.message}
                    </p>
                  )}

                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setValue("image_url", preset.url, { shouldValidate: true })}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                          watchedImageUrl === preset.url
                            ? "bg-primary text-primary-foreground border-primary font-medium"
                            : "bg-surface-subtle text-muted-foreground border-border hover:text-foreground hover:bg-surface"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/manage-events")}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="min-w-[150px]">
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {mode === "create" ? "Creating..." : "Saving..."}
                      </>
                    ) : mode === "create" ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Publish Event
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Preview Card (1 column) */}
        <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-24">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Live Preview Card
          </div>
          <Card className="glass-panel overflow-hidden border-border/80 shadow-soft">
            <div className="aspect-[16/9] w-full relative bg-surface-subtle overflow-hidden">
              {watchedImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={watchedImageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback on broken image
                    (e.target as HTMLImageElement).src =
                      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&auto=format&fit=crop&q=80";
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <ImageIcon className="w-8 h-8 opacity-40" />
                </div>
              )}
              {selectedCategoryObj && (
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="backdrop-blur-md">
                    {selectedCategoryObj.name}
                  </Badge>
                </div>
              )}
            </div>

            <CardContent className="p-5 space-y-3">
              <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-2">
                {watchedTitle || "Untitled Event Title"}
              </h3>

              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  <span>{watchedDate || "Date TBD"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-primary" />
                  <span className="truncate">{watchedLocation || "Location TBD"}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Seats</span>
                <span className="font-semibold text-foreground">
                  0 / {watch("max_attendees") || 50}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground space-y-1.5">
            <div className="font-semibold text-primary flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" /> Pro-Tip for Organizers
            </div>
            <p>
              High-resolution cover photos and clear, agenda-driven descriptions boost attendee
              conversion by up to 60%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
