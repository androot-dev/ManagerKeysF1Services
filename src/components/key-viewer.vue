<template>
  <div class="key-viewer">
    <ul>
      <item-key
        v-for="key in result"
        v-bind:key="key"
        :colorsGroup="colorsGroup"
        :data="key"
      ></item-key>
    </ul>
    <div class="suggestions" v-if="this.goodMatches.length > 0">
      <span>Sugerencias <LightbulbOn /></span>
      <item-key
        class="suggestion-item"
        v-for="key in goodMatches"
        v-bind:key="key"
        :data="key"
        :colorsGroup="colorsGroup"
      ></item-key>
    </div>
  </div>
</template>
<script>
import ownKeys from "@/own-keys";
import colocatedKeys from "@/colocated-keys";
import itemKey from "@/components/item-key";
import { LightbulbOn } from "mdue";
export default {
  props: {
    search: {
      type: Array,
      required: true,
    },
    wordsVariation: {
      //no esta utilizandose
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      ownKeys,
      colorsGroup: {
        "LIMA 7": "#0097e6",
        "LIMA 8": "#4cd137",
        "LIMA 9": "#fd79a8",
        "LIMA 10": "#e66767",
        "NORTE 1": "#fff200",
        "NORTE 2": "#eb4d4b",
        "NORTE 3": "#f0932b",
        "OESTE 1": "#5f27cd",
        "OESTE 2": "#0c2461",
        "OESTE 3": "#000000",
        "OESTE 4": "#2ecc71",
      },
      colocatedKeys,
      keys: ownKeys.concat(colocatedKeys),
      result: [],
      goodMatches: [],
    };
  },
  methods: {
    identifySimilarWord(search, word) {
      let result = "";
      let identify = (search, word) => {
        let finish = false;
        while (finish == false) {
          let res = word.search(search);
          if (res == -1) {
            //elminar la ultima letra del string search
            search = search.substring(0, search.length - 1);
          } else if (search.length == 0) {
            finish = true;
          } else {
            finish = true;
          }
        }
        return search;
      };
      search = search.toLowerCase();
      word = word.toLowerCase();
      result = identify(search, word);
      if (result.length == 0) {
        //search en reversa
        result = search.split("").reverse().join("");
        word = word.split("").reverse().join("");
        result = identify(result, word);
        result = result ? result.split("").reverse().join("") : 0;
      }

      let percentWord = (result.length * 100) / search.length;
      //reducir el porcentaje en base a la diferencia entre word y search
      percentWord = percentWord - (word.length - search.length);
      /*let indexBestWord = word.search(result);
      let wordBest = word.substring(
        indexBestWord,
        indexBestWord + result.length
      );*/
      let percent = percentWord;
      return percent;
    },
    binaryfilter(conditioner, data, tocompare) {
      let low = 0;
      let high = data.length - 1;
      let mid = 0;
      let matches = 0;
      while (low <= high) {
        mid = Math.floor((low + high) / 2);
        if (conditioner(data, mid)) {
          matches++;

          this.result = this.result.concat(data[mid]);
        } else if (tocompare < data[mid].name.toLowerCase()) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
        if (matches == 2) {
          //restabler backoup en data
          break;
        }
      }
    },
    normalfilter(conditioner, data) {
      let matches = 0;
      for (let i = 0; i < data.length; i++) {
        if (conditioner(data, i)) {
          this.result = this.result.concat(data[i]);
          matches++;
        }
        if (matches == 2) {
          break;
        }
      }
    },
    searchAlgorithmics() {
      //console.log(this.search);
      //ordenar keys por name

      this.goodMatches = [];
      //busqueda binaria
      if (this.search.length == 0 || this.search[0] == "") {
        this.result = [];
        this.goodMatches = [];
        return false;
      }
      let search = this.search;
      if (this.search[0] == "all-keys") {
        this.result = this.ownKeys;
        return false;
      }
      if (this.search[0] == "all-keys-colocated") {
        this.result = this.colocatedKeys;
        return false;
      }
      this.result = [];
      let keys = this.keys;
      let goodMatches = [];
      //buscar los valores del array search en los name de keys(los cuales estan ordenados alfabeticamente)
      for (let i in search) {
        this.normalfilter((key, index) => {
          //quitar_ a key[index].name
          let keyName = key[index].name.replace(/_/g, "");

          if (search[i] == keyName && this.result.indexOf(key[index]) == -1) {
            return true;
          }
          return false;
        }, keys);
      }

      for (let i = 0; i < this.keys.length; i++) {
        for (let j in search) {
          let sosomatch_filter = false;
          let sosomatch = 0;

          sosomatch = this.identifySimilarWord(search[j], this.keys[i].name);
          let sosomatchreverse = this.identifySimilarWord(
            search[j].split("").reverse().join(""),
            this.keys[i].name.split("").reverse().join("")
          );
          sosomatch =
            sosomatchreverse > sosomatch ? sosomatchreverse : sosomatch;
          if (search[j].length > 6) {
            if (sosomatch > 70) {
              sosomatch_filter = true;
            }
          }
          this.keys[i].match_percent = sosomatch ? sosomatch : 0;

          if (this.keys[i].name.includes(search[j]) || sosomatch_filter) {
            if (
              this.result.includes(this.keys[i]) ||
              this.goodMatches.includes(this.keys[i])
            ) {
              break;
            }

            this.goodMatches.push(this.keys[i]);
          }
        }
        //ordenar this.goodMatches por mayor match_percent

        this.goodMatches.sort((a, b) => {
          return b.match_percent - a.match_percent;
        });
      }
    },
  },
  watch: {
    search: {
      handler() {
        this.searchAlgorithmics();
      },
      deep: true,
    },
  },
  mounted() {
    this.keys.sort((a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  },

  components: { itemKey, LightbulbOn },
};
</script>
<style lang="scss" scoped>
@import "@/_basic.scss";
.key-viewer {
  @include flex(center, nowrap, column, space-between);

  ul {
    list-style: none;
    margin: 10px 0;
    width: 100vw;
    @include flex(center, wrap);
  }
  .suggestions {
    position: relative;
    align-self: flex-end;
    @include flex(space-around, wrap);

    margin: 10px 0%;
    width: 100%;
    height: auto;

    font-size: 13px;
    .suggestion-item {
      list-style: none;
    }
    span {
      margin-bottom: 6px;
      margin: 0 50%;
      border-radius: 40px;
      padding: 4px 10px;
      background: #ebdc09d9;
      width: auto;
      @include flex(space-between);
      box-shadow: 10px 10px 24px -16px rgba(0, 0, 0, 0.75);
      color: black;
      font-family: "nunito-bold";
      svg {
        margin-left: 5px;
        font-size: 18px;
        margin-top: -3px;
        fill: rgb(12, 12, 12);
      }
    }
  }
}
</style>
