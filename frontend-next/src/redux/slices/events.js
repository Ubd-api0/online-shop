import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const createEvent = createAsyncThunk(
  "events/create",
  async (newForm, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/event/create-event", newForm, {
        headers: { "Content-Type": "application/json" },
      });
      // API responds with `product` (matches the original backend's response
      // key, even for events) — read that key here so the create flow works.
      return data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllEventsShop = createAsyncThunk(
  "events/getAllShop",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/event/get-all-events/${id}`);
      return data.events;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/event/delete-shop-event/${id}`);
      return data.message;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllEvents = createAsyncThunk(
  "events/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/event/get-all-events");
      return data.events;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const eventSlice = createSlice({
  name: "events",
  initialState: { isLoading: true },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.event = action.payload;
        state.success = true;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(getAllEventsShop.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllEventsShop.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload;
      })
      .addCase(getAllEventsShop.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteEvent.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.message = action.payload;
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getAllEvents.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allEvents = action.payload;
      })
      .addCase(getAllEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors } = eventSlice.actions;
export default eventSlice.reducer;
