import axios from "axios";
import { server } from "../../server";

// Public storefront content: categories + hero + feature tiles + store info.
export const getStorefront = () => async (dispatch) => {
  try {
    dispatch({ type: "storefrontRequest" });
    const { data } = await axios.get(`${server}/shop/storefront`);
    dispatch({ type: "storefrontSuccess", payload: data });
  } catch (error) {
    dispatch({
      type: "storefrontFail",
      payload: error.response?.data?.message || "Could not load storefront",
    });
  }
};

// ---- owner category CRUD (re-fetches storefront on success) ----
const cfg = { withCredentials: true };

export const createCategory = (payload) => async (dispatch) => {
  await axios.post(`${server}/category/create`, payload, cfg);
  dispatch(getStorefront());
};

export const updateCategory = (id, payload) => async (dispatch) => {
  await axios.put(`${server}/category/update/${id}`, payload, cfg);
  dispatch(getStorefront());
};

export const deleteCategory = (id) => async (dispatch) => {
  await axios.delete(`${server}/category/delete/${id}`, cfg);
  dispatch(getStorefront());
};

export const updateStorefront = (payload) => async (dispatch) => {
  await axios.put(`${server}/shop/update-storefront`, payload, cfg);
  dispatch(getStorefront());
};
