<template>
  <li>
    <div class="container-id">
      <ShareCircle class="ShareCircle" @click="sharedForWhatsapp" />
      <span
        class="electronic-key"
        :id="'key-electronic' + idcomponent"
        v-if="electronicKeys[data.code]"
        ><img style="width: 15px; height: 20px" :src="electronicIcon" />
        {{ data.time }}</span
      >
      <ToolTip :on="'#key-electronic' + idcomponent" :await="0" theme="light">
        <Information style="margin-right: 5px; margin-bottom: -5px" />
        <ul>
          Este site usa cerradura electronica:
          <br />
          <li
            v-for="cerradura in electronicKeys[data.code]"
            v-bind:key="cerradura"
          >
            {{ cerradura }}
          </li>
        </ul>
      </ToolTip>
      <div
        class="tag-group"
        :style="
          'background-color:' +
          colorsGroup[data.group] +
          '; color:' +
          whiteOrBlack(colorsGroup[data.group])
        "
      >
        {{ data.group }} <Tag />
      </div>
      <span class="priority">{{ data.priority }}</span>
      <div class="title">{{ data.longname }}</div>
      <div class="content">
        <div class="details-icons">
          <span v-if="data['number-keys'] > 0"
            ><Key /> {{ data["number-keys"] }}</span
          >
          <span
            ><MapMarker />
            <a
              target="_blank"
              :href="
                'https://maps.google.com/?q=' +
                data.latitude +
                ',' +
                data.longitude
              "
              >Ubicación</a
            ></span
          >
        </div>
        <ul class="considerations">
          <li v-if="consideration1 && consideration1 != ''">
            {{ consideration1 }}
          </li>
          <br />
          <li v-if="consideration2 && consideration2 != ''">
            {{ consideration2 }}
          </li>
          <li
            class="considerations-none"
            v-if="
              (!consideration2 || consideration2 == '') &&
              (!consideration1 || consideration1 == '')
            "
          >
            <span>No hay consideraciones</span>
          </li>
        </ul>
      </div>
    </div>
  </li>
</template>
<script>
import { Tag, Key, MapMarker, ShareCircle, Information } from "mdue";
import keyChain from "@/assets/key-chain.png";
import electronicIcon from "@/assets/electronic-key.png";
import electronicKeys from "@/electronic-keys";
let idcomponent = 0;
export default {
  props: {
    data: {
      type: Object,
      required: true,
    },
    colorsGroup: { type: Object, required: true },
  },
  components: {
    Tag,
    Key,
    MapMarker,
    ShareCircle,
    Information,
  },
  data() {
    return {
      idcomponent,
      electronicKeys,
      electronicIcon,
      keyChain,
    };
  },
  created() {
    idcomponent++;
  },
  computed: {
    consideration1() {
      //poner la primera letra mayuscula y las demas minusculas
      if (this.data.consideration1 && this.data.consideration1 != "") {
        return (
          this.data.consideration1.charAt(0).toUpperCase() +
          this.data.consideration1.slice(1).toLowerCase()
        );
      } else {
        return undefined;
      }
    },
    consideration2() {
      //poner la primera letra mayuscula y las demas minusculas
      if (this.data.consideration2 && this.data.consideration2 != "") {
        return (
          this.data.consideration2.charAt(0).toUpperCase() +
          this.data.consideration2.slice(1).toLowerCase()
        );
      } else {
        return undefined;
      }
    },
    whatsappShareText() {
      let cadena = `
      *Site*: ${this.data.longname}\n*Ubicacion*: https://maps.google.com/?q=${
        this.data.latitude
      },${this.data.longitude} \n*Prioridad*:_${
        this.data.priority
      }_\n*Origen*: _${
        this.data.group.charAt(0).toUpperCase() +
        this.data.group.substring(1, this.data.group.length).toLowerCase()
      }_\n*Dirección*: _${this.data.address}_\n*Coubicado en*: _${
        this.data["co-located"]
      }_\n${
        this.data["number-keys"] == 0
          ? ""
          : "*LLaves*: _" + this.data["number-keys"] + "_\n"
      }${
        this.consideration1
          ? "*Consideraciones*:\n   _* " + this.consideration1 + "_\n"
          : ""
      }${
        this.consideration2 ? "   _* " + this.consideration2 + "_\n" : ""
      }*Grupo Electrogeno*: _${
        this.data["g-electrogeno"].charAt(0).toUpperCase() +
        this.data["g-electrogeno"]
          .substring(1, this.data["g-electrogeno"].length)
          .toLowerCase()
      }_`;
      return cadena.replace(/\n/g, "%0A");
    },
  },
  methods: {
    whiteOrBlack(text) {
      // Convirtiendo String Hexadecimal a RGB
      if (text) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(text);
        var rgb = result
          ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
            }
          : null;
        //Formula que determinara el color blanco o negro de las letras
        return this.contrast(rgb);
      }
    },
    contrast(rgb) {
      let C = [rgb.r / 255, rgb.g / 255, rgb.b / 255];

      for (var i = 0; i < C.length; ++i) {
        if (C[i] <= 0.03928) {
          C[i] = C[i] / 12.92;
        } else {
          C[i] = Math.pow((C[i] + 0.055) / 1.055, 2.4);
        }
      }
      let L = 0.2126 * C[0] + 0.7152 * C[1] + 0.0722 * C[2];

      if (L > 0.179) {
        return "black";
      } else {
        return "white";
      }
    },
    sharedForWhatsapp() {
      window.open(
        `https://api.whatsapp.com/send?text=${this.whatsappShareText}`,
        "_blank"
      );
    },
  },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
@keyframes slide-in-left {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}
.tooltip {
  background: pink;
  width: 250px;
  font-size: 11px;
  ul {
    width: 100%;
    font-size: 13px;
    justify-content: flex-start;
    align-items: flex-start;
    font-family: "nunito-bold";

    li {
      width: 100%;
      font-size: 11px;

      height: auto;
      background: none;
      animation: none;
      justify-content: flex-start;
      align-items: flex-start;
      text-align: left;
      padding: 0;
      margin: 10px 19px;
    }
  }
}
.electronic-key {
  margin-right: 3px;
  margin-bottom: -5px;
  //animacion
  animation: slide-in-left 0.8s ease-in-out;
}
li {
  //aparecer de derecha a izquierda
  animation: slide-in-left 0.3s ease-in-out;
  width: 300px;
  height: 150px;
  background: #d3d3d3;
  margin: 10px;
  border-radius: 10px;
  padding: 10px;
  color: black;
  .container-id {
    .priority {
      margin-left: 5px;
      font-size: 11px;
      font-weight: 900;
    }
    @include flex(flex-start, wrap);
    position: relative;
    .ShareCircle {
      position: absolute;
      right: 0px;
      top: 0px;
      font-size: 20px;
      fill: #8a8a8a;
      cursor: pointer;
      &:hover {
        fill: black;
      }
    }
    .tag-group {
      box-shadow: 0px 0px 40px -6px rgba(0, 0, 0, 0.75);
      border-radius: 20px;
      padding: 3px 10px;
      font-size: 11.5px;
      font-family: "Roboto-Black";
      width: auto;
      background: #8a8a8a;
      svg {
        margin-bottom: -2px;
      }
    }
    .title {
      font-size: 13px;
      font-family: "Roboto-Black";

      width: 100%;
      text-align: left;
      margin: 9px 5px;
    }
    .content {
      width: 100%;
      @include flex(space-between, nowrap, row, flex-start);

      .details-icons {
        @include flex(flex-start, wrap, column, flex-start);
        width: 20%;
        margin: 0px;
        padding: 0px;
        font-size: 11px;
        text-align: left;
        font-family: "nunito-light";

        span {
          @include flex(flex-start);
          font-size: 12px;
          margin-left: 5px;

          a {
            color: black;
            text-decoration: none;
            &:hover {
              color: rgb(0, 0, 0);
              text-decoration: underline;
            }
          }
          svg {
            font-size: 15px;
            margin-right: 2px;
          }
        }
      }
      .considerations {
        width: 70%;
        @include scrollbar("y");
        height: 65px;
        padding: 0 5px;
        @include flex(center, wrap);

        li {
          text-align: left;
          font-size: 10px;
          list-style-type: disc;
          width: auto;
          height: auto;
          margin: 0;
          padding: 0;
          background: none;
        }
        .considerations-none {
          list-style-type: none;
        }
      }
    }
  }
}
</style>
