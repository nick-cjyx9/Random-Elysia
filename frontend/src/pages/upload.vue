<script setup lang="ts">
import { client } from '~/main'

const fileNow: Ref<File | undefined> = ref()
const uploadedData: Ref<any> = ref()
const imageLink: Ref<string | undefined> = ref()
const tags: Ref<string> = ref('')
const uploading: Ref<boolean> = ref(false)
const tagging: Ref<boolean> = ref(false)
const submitting: Ref<boolean> = ref(false)

function getFile(e: Event) {
  const target = e.target as HTMLInputElement
  fileNow.value = target.files![0]
}

async function handleGetTags() {
  tagging.value = true
  const resp = await client.getTags.post({
    image: fileNow.value!,
  })
  tags.value = resp.data as string
  tagging.value = false
}

async function handleUpload() {
  uploading.value = true
  const resp = await client.upload.post({
    image: fileNow.value!,
  })
  uploadedData.value = resp.data
  uploading.value = false
  imageLink.value = resp.data.url as string
}

async function handleSubmit() {
  submitting.value = true
  const resp = await client.item.new.post({
    link: imageLink.value as string,
    del_link: uploadedData.value.delete,
    tags: tags.value.split(','),
  })
  submitting.value = false
  if (resp.data?.success) {
    // eslint-disable-next-line no-alert
    alert('Uploaded!')
    location.reload()
  }
  else {
    // eslint-disable-next-line no-alert
    alert('Failed to upload, please try again')
  }
}
</script>

<template>
  <div flex flex-col items-center justify-center>
    <h1 text-size-4xl font-500 font-serif>
      Random <font text-pink-4>
        Elysia
      </font><small text-size-xl>manage board</small>
    </h1>
    <div py-2 space-y-2>
      <a href="/manage" hover:text-pink-4>🔙 Back to images</a>
      <h2 text-size-2xl font-serif>
        Step 1. Upload Image
      </h2>
      <input type="file" @change="getFile($event)">
      <button btn disabled:animate-pulse :disabled="uploading" @click="handleUpload()">
        Submit
      </button>
    </div>
  </div>
  <div v-if="uploadedData" flex flex-col items-center py-2 space-y-2>
    <h2 text-size-2xl font-serif>
      Step 2. Tag the image
    </h2>
    <img :src="imageLink" alt="preview" max-w-72 border-1 border-pink rounded>
    <div float-left text-size-xl>
      Link: {{ imageLink }}
    </div>
    <div float-left text-size-xl space-x-5>
      Tags: <input v-model="tags" type="text" ml-4 border-b-2 border-b-slate bg-transparent px-4 py-1 outline-none focus:border-b-pink>
    </div>
    <hr>
    <div space-x-3>
      <button btn disabled:animate-pulse :disabled="tagging" @click="handleGetTags()">
        Complete tags
      </button>
      <button :disabled="submitting" mt-6 btn disabled:animate-pulse @click="handleSubmit()">
        Create Image
      </button>
    </div>
  </div>
</template>
