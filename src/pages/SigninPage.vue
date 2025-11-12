<template>
  <v-layout id="signin-layout">
    <v-container id="signin-container" class="text-center">
      <div id="signin-form-area" class="safe-area-a">
        <div id="signin-title" class="text-h5 mb-6">Sign in</div>
        <v-text-field id="signin-username-field" variant="outlined" label="Username" />
        <v-text-field id="signin-password-field" variant="outlined" label="Password" type="password" />
        <v-btn id="signin-submit-btn" block color="primary" replace to="/" class="mb-4">Sign in</v-btn>
        <v-btn id="signin-github-btn" block to="/" replace>
          <v-icon icon="mdi-github"></v-icon>
          Sign in with Githab
        </v-btn>
      </div>
    </v-container>
  </v-layout>
</template>
