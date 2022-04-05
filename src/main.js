import { createApp } from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import AlertIw from "@/components/global/AlertIw";
import ToolTip from "@/components/global/ToolTip";

let app = createApp(App);
app.component("AlertIw", AlertIw);
app.component("ToolTip", ToolTip);
app.use(router);
app.mount("#app");
