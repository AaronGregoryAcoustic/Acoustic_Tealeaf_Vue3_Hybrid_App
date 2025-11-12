<template>
  <v-container id="me-container">
    <v-list id="me-profile-list" class="mb-2">
      <v-list-item id="me-profile-header" prepend-avatar="https://picsum.photos/200/200" title="Grant">
        <v-list-item-title id="me-profile-header-title">Grant</v-list-item-title>
      </v-list-item>

      <v-list-item id="me-moments-item" prepend-icon="mdi-image">
        <v-list-item-title id="me-moments-title">Moments</v-list-item-title>
      </v-list-item>

      <v-list-item id="me-settings-item" prepend-icon="mdi-cog-outline">
        <v-list-item-title id="me-settings-title">Settings</v-list-item-title>
      </v-list-item>
      <v-list-item id="me-about-item" prepend-icon="mdi-information">
        <v-list-item-title id="me-about-title">About</v-list-item-title>
      </v-list-item>
    </v-list>

    <v-btn id="me-sign-out-btn" block @click="$router.replace('/signin')">Sign Out</v-btn>
  </v-container>
</template>
