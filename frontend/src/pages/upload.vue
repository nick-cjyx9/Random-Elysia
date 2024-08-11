<script setup lang="ts">
import { client } from '~/main'

const uploadedData: Ref<any> = ref()
const imageLink: Ref<string | undefined> = ref()
const previewLink: Ref<string | undefined> = ref()
const tags: Ref<string> = ref('')
const uploading: Ref<boolean> = ref(false)
const tagging: Ref<boolean> = ref(false)
const submitting: Ref<boolean> = ref(false)
const file: Ref<File | undefined> = ref()

async function getFile(e: Event) {
  const target = e.target as HTMLInputElement
  file.value = target.files![0]
  if (!file.value)
    return
  const fileread = new FileReader()
  fileread.onload = (e) => {
    previewLink.value = e.target!.result as string
  }
  fileread.readAsDataURL(file.value)
  uploading.value = true
  const resp = await client.upload.post({ image: file.value }, {
    fetch: {
      credentials: 'include',
    },
  })
  if (!resp.data?.success) {
    // eslint-disable-next-line no-alert
    alert(resp.data?.message)
    return
  }
  uploadedData.value = resp.data
  uploading.value = false
  imageLink.value = resp.data.url as string
}

async function handleGetTags() {
  tagging.value = true
  const resp = await client.getTags.post({
    image: file.value!,
  })
  tags.value = resp.data as string
  tagging.value = false
}

async function handleSubmit() {
  submitting.value = true
  const resp = await client.item.new.post({
    link: imageLink.value as string,
    del_link: uploadedData.value.delete,
    tags: tags.value.split(','),
  }, {
    fetch: {
      credentials: 'include',
    },
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
    <div v-show="!previewLink" py-2 space-y-2>
      <a href="/manage" hover:text-pink-4>🔙 Back to images</a>
      <h2 text-size-2xl font-serif>
        Step 1. Upload Image
      </h2>
      <div id="box" style="display: flex; flex-direction: column;">
        <label for="file">
          <i class="upload"><svg
            xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
            class="bi bi-upload" viewBox="0 0 16 16"
          >
            <path
              d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"
            />
            <path
              d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"
            />
          </svg></i>
          <input id="file" type="file" @change="getFile($event)">
          上传图片
        </label>
      </div>
    </div>
  </div>
  <div v-if="previewLink" flex flex-col items-center py-2 space-y-2>
    <h2 text-size-2xl font-serif>
      Step 2. Tag the image
    </h2>
    <img :src="previewLink" alt="preview" max-w-72 border-1 border-pink rounded>
    <div w-xs flex flex-col items-start>
      <div w-full overflow-hidden text-ellipsis text-start text-nowrap text-size-xl font-serif>
        Link: &nbsp;&nbsp;&nbsp;{{ imageLink ? imageLink : 'Uploading...' }}
      </div>
      <div text-size-xl font-serif space-x-5>
        Tags: <input
          v-model="tags" type="text" ml-3 border-b-2 border-b-slate bg-transparent outline-none
          focus:border-b-pink
        >
      </div>
    </div>
    <div space-x-3>
      <button btn disabled:animate-pulse :disabled="tagging" @click="handleGetTags()">
        Complete tags
      </button>
      <button :disabled="submitting || imageLink === undefined" mt-6 btn disabled:animate-pulse @click="handleSubmit()">
        Create Image
      </button>
    </div>
  </div>
</template>

<style scoped>
input[type='file'] {
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

label {
  font-weight: bold;
  color: pink;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 2px dashed pink;
  padding: 3rem;
  flex-direction: column;
}

label > i {
  margin-bottom: 5px;
}

#box img {
  flex-direction: row;
}
</style>
