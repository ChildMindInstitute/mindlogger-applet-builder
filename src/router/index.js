import Vue from "vue";
import Router from "vue-router";
import ProtocolBuilder from "../components/ProtocolBuilder/ProtocolBuilder.vue";
import ConditionalItemBuilder from "../components/ProtocolBuilder/ConditionalItemBuilder.vue";

Vue.use(Router);

let router = new Router({
  routes: [
    {
      path: "/",
      name: "Builder",
      component: ProtocolBuilder,
    },
    {
      path: "/conditional-item-builder",
      name: "ConditionalItemBuilder",
      component: ConditionalItemBuilder,
    },
  ],
});

export default router;
