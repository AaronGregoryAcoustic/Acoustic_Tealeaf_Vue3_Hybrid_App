<template>
  <v-container id="nearby-container">
    <v-row dense>
      <v-col 
        v-for="card in cards" 
        :key="card.title" 
        :cols="card.flex"
        :id="`col-nearby-${titleToId(card.title)}`"
      >
        <v-card :id="`nearby-card-${titleToId(card.title)}`">
          <v-img
            :id="`nearby-image-${titleToId(card.title)}`"
            :src="card.src"
            class="white--text align-end"
            gradient="to bottom, rgba(0,0,0,.1), rgba(0,0,0,.5)"
            height="200px"
            cover
          >
            <v-card-title 
              :id="`nearby-title-${titleToId(card.title)}`"
              class="text-white" 
              v-text="card.title"
            ></v-card-title>
          </v-img>

          <v-card-actions :id="`actions-nearby-${titleToId(card.title)}`">
            <v-spacer></v-spacer>

            <v-btn
              :id="`nearby-like-btn-${titleToId(card.title)}`"
              size="small"
              color="surface-variant"
              variant="text"
              icon="mdi-heart"
            ></v-btn>

            <v-btn
              :id="`nearby-bookmark-btn-${titleToId(card.title)}`"
              size="small"
              color="surface-variant"
              variant="text"
              icon="mdi-bookmark"
            ></v-btn>

            <v-btn
              :id="`nearby-share-btn-${titleToId(card.title)}`"
              size="small"
              color="surface-variant"
              variant="text"
              icon="mdi-share-variant"
            ></v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts" setup>
import { ref } from "vue";

// Utility function to convert title to kebab-case for consistent IDs
const titleToId = (title: string): string => {
  return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
};

const cards = ref([
  {
    title: "Pre-fab homes",
    src: "https://cdn.vuetifyjs.com/images/cards/house.jpg",
    flex: 12,
  },
  {
    title: "Favorite road trips",
    src: "https://cdn.vuetifyjs.com/images/cards/road.jpg",
    flex: 6,
  },
  {
    title: "Best airlines",
    src: "https://cdn.vuetifyjs.com/images/cards/plane.jpg",
    flex: 6,
  },
]);
</script>
