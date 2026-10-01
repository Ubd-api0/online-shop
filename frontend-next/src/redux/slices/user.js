import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

export const loadUser = createAsyncThunk("user/load", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/user/getuser");
    return data.user;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

export const updateUserInformation = createAsyncThunk(
  "user/updateInfo",
  async ({ name, email, phoneNumber, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/user/update-user-info", {
        name,
        email,
        phoneNumber,
        password,
      });
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateUserAddress = createAsyncThunk(
  "user/updateAddress",
  async ({ fullName, phone, country, province, city, address1, address2, zipCode, addressType, _id }, { rejectWithValue }) => {
    try {
      const { data } = await api.put("/user/update-user-addresses", {
        fullName,
        phone,
        country: country || "PK",
        province,
        city,
        address1,
        address2,
        zipCode,
        addressType,
        _id,
      });
      return { successMessage: "User address updated succesfully!", user: data.user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deleteUserAddress = createAsyncThunk(
  "user/deleteAddress",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.delete(`/user/delete-user-address/${id}`);
      return { successMessage: "Address deleted successfully!", user: data.user };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllUsers = createAsyncThunk("user/getAll", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/user/admin-all-users");
    return data.users;
  } catch (error) {
    return rejectWithValue(error.response?.data?.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: { isAuthenticated: false },
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(updateUserInformation.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUserInformation.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateUserInformation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserAddress.pending, (state) => {
        state.addressloading = true;
      })
      .addCase(updateUserAddress.fulfilled, (state, action) => {
        state.addressloading = false;
        state.successMessage = action.payload.successMessage;
        state.user = action.payload.user;
      })
      .addCase(updateUserAddress.rejected, (state, action) => {
        state.addressloading = false;
        state.error = action.payload;
      })
      .addCase(deleteUserAddress.pending, (state) => {
        state.addressloading = true;
      })
      .addCase(deleteUserAddress.fulfilled, (state, action) => {
        state.addressloading = false;
        state.successMessage = action.payload.successMessage;
        state.user = action.payload.user;
      })
      .addCase(deleteUserAddress.rejected, (state, action) => {
        state.addressloading = false;
        state.error = action.payload;
      })
      .addCase(getAllUsers.pending, (state) => {
        state.usersLoading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearErrors } = userSlice.actions;
export default userSlice.reducer;
