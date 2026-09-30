import connectDB from "@/lib/db/connect";
import Event from "@/lib/db/models/Event";
import Shop from "@/lib/db/models/Shop";
import Order from "@/lib/db/models/Order";
import { ApiError } from "@/lib/api/errors";

export async function createEvent(eventData) {
  await connectDB();
  const shop = await Shop.findById(eventData.shopId);
  if (!shop) throw new ApiError("Shop Id is invalid!", 400);

  return Event.create({ ...eventData, shop });
}

export async function listAllEvents() {
  await connectDB();
  return Event.find();
}

export async function listAllEventsSorted() {
  await connectDB();
  return Event.find().sort({ createdAt: -1 });
}

export async function findEventById(id) {
  await connectDB();
  return Event.findById(id);
}

export async function listEventsByShop(shopId) {
  await connectDB();
  return Event.find({ shopId });
}

export async function deleteShopEvent(id) {
  await connectDB();
  const event = await Event.findByIdAndDelete(id);
  if (!event) throw new ApiError("Event not found with this id!", 500);
}

export async function reviewEvent({ user, rating, comment, productId, orderId }) {
  await connectDB();
  const event = await Event.findById(productId);
  const review = { user, rating, comment, productId };

  const isReviewed = event.reviews.find((rev) => rev.user._id === user._id);
  if (isReviewed) {
    event.reviews.forEach((rev) => {
      if (rev.user._id === user._id) {
        rev.rating = rating;
        rev.comment = comment;
        rev.user = user;
      }
    });
  } else {
    event.reviews.push(review);
  }

  let avg = 0;
  event.reviews.forEach((rev) => {
    avg += rev.rating;
  });
  event.ratings = avg / event.reviews.length;

  await event.save({ validateBeforeSave: false });

  await Order.findByIdAndUpdate(
    orderId,
    { $set: { "cart.$[elem].isReviewed": true } },
    { arrayFilters: [{ "elem._id": productId }], new: true }
  );
}
