import mongoose, { Schema, InferSchemaType, Model } from "mongoose";

const ActionItemSchema = new Schema(
  {
    task: { type: String, required: true },
    assignee: { type: String, default: null },
    deadline: { type: String, default: null },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
  },
  { _id: false }
);

const TranscriptSegmentSchema = new Schema(
  {
    speaker: { type: String, default: null },
    start: { type: Number, default: null },
    end: { type: Number, default: null },
    text: { type: String, required: true },
  },
  { _id: false }
);

const MeetingSchema = new Schema(
  {
    title: { type: String, required: true },
    audioFileName: { type: String, required: true },
    audioSizeBytes: { type: Number, required: true },
    durationSeconds: { type: Number, default: null },
    status: {
      type: String,
      enum: ["pending", "transcribing", "summarizing", "completed", "failed"],
      default: "pending",
      index: true,
    },
    error: { type: String, default: null },

    transcript: { type: String, default: "" },
    segments: { type: [TranscriptSegmentSchema], default: [] },

    summary: { type: String, default: "" },
    keyDecisions: { type: [String], default: [] },
    risks: { type: [String], default: [] },
    actionItems: { type: [ActionItemSchema], default: [] },

    followUpEmail: {
      to: { type: [String], default: [] },
      subject: { type: String, default: "" },
      body: { type: String, default: "" },
      sentAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

export type MeetingDoc = InferSchemaType<typeof MeetingSchema> & { _id: mongoose.Types.ObjectId };

export const Meeting: Model<MeetingDoc> =
  (mongoose.models.Meeting as Model<MeetingDoc>) ||
  mongoose.model<MeetingDoc>("Meeting", MeetingSchema);
