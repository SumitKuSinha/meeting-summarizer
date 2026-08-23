import mongoose from 'mongoose';

const ActionItemSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
      trim: true
    },
    assignee: {
      type: String,
      default: 'Unassigned',
      trim: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      default: 'Medium'
    }
  },
  { _id: false }
);

const MeetingSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true
    },
    transcript: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    overview: {
      type: String,
      required: true
    },
    key_decisions: [
      {
        type: String,
        trim: true
      }
    ],
    action_items: [ActionItemSchema]
  },
  {
    timestamps: true
  }
);

const Meeting = mongoose.model('Meeting', MeetingSchema);

export default Meeting;
