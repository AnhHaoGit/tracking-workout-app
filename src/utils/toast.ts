import Toast from "react-native-toast-message";

const showToast = (type: string, text2: string) => {
  Toast.show({
    type,
    text1:
      type === "successToast"
        ? "Success"
        : type === "infoToast"
          ? "Info"
          : "Error",
    text2,
    topOffset: 60,
    visibilityTime: 2000,
    position: 'top',
  });
};
export default showToast;
