<template>
  <div>
    <mavon-editor
      :value="value"
      ref="md"
      @input="$emit('input', $event)"
      :language="'en'"
      @imgAdd="$imgAdd"
    >
      <template slot="left-toolbar-after">
        <div
          aria-hidden="true"
          class="video_play"
          :class="{'selected': videoDropDown}"
          type="button"
          @mouseleave="$mouseleave_video_dropdown"
          @mouseenter="$mouseenter_video_dropdown"
        >
          <v-icon>video_library</v-icon>
          <transition name="fade"> 
              <div 
                class="op-image popup-dropdown transition"
                v-show="videoDropDown"
                @mouseleave="$mouseleave_video_dropdown"
                @mouseenter="$mouseenter_video_dropdown"
              >
                  <div 
                    class="dropdown-item"
                    @click.stop="linkType='Video'; linkDialog=true;"
                  >
                    <span>Video Link</span>
                  </div>
                  <div
                    class="dropdown-item"
                    style="overflow: hidden"
                  >
                    <input
                      type="file"
                      accept="video/*"
                      @change="$addMedia"
                    />
                    Upload Video
                  </div>
              </div>
          </transition>
        </div>

        <div
          aria-hidden="true"
          class="audio_play"
          :class="{'selected': audioDropDown}"
          type="button"
          @mouseleave="$mouseleave_audio_dropdown"
          @mouseenter="$mouseenter_audio_dropdown"
        >
          <v-icon>audiotrack</v-icon>
          <transition name="fade"> 
              <div 
                class="op-image popup-dropdown transition"
                v-show="audioDropDown"
                @mouseleave="$mouseleave_audio_dropdown"
                @mouseenter="$mouseenter_audio_dropdown"
              >
                  <div 
                    class="dropdown-item"
                    @click.stop="linkType='Audio'; linkDialog=true;"
                  >
                    <span>Audio Link</span>
                  </div>
                  <div
                    class="dropdown-item"
                    style="overflow: hidden"
                  >
                    <input
                      type="file"
                      accept="audio/*"
                      @change="$addMedia"
                    />
                    Upload Audio
                  </div>
              </div>
          </transition>
        </div>
      </template>
    </mavon-editor>

    <v-dialog
      v-model="isUploading"
      persistent
      width="400"
    >
      <v-card class="pt-5 pb-6 text-center">
        <v-progress-circular class="d-block mx-auto mt-2" color="primary" indeterminate :size="50">
        </v-progress-circular>
        <span> Uploading ... </span>
      </v-card>
    </v-dialog>

    <transition name="fade">
        <div class="add-link-wrapper" v-if="linkDialog">
            <div class="add-link">
                <i @click.stop.prevent="linkDialog = false" class="fa fa-mavon-times"
                    aria-hidden="true"></i>
                <h3 class="title">{{`Add Link ${linkType}`}}</h3>
                <div class="link-text input-wrapper">
                    <input ref="linkTextInput" type="text" v-model="linkText" :placeholder="`${linkType} text`">
                </div>
                <div class="link-addr input-wrapper">
                    <input type="text" v-model="linkAddr" :placeholder="`${linkType} address`">
                </div>
                <div class="op-btn cancel" @click.stop="linkDialog = false">{{'Cancel'}}</div>
                <div class="op-btn sure" @click.stop="$linkAdd()">{{'Sure'}}</div>
            </div>
        </div>
    </transition>
  </div>
</template>

<style lang="scss" scoped>
  .video_play, .audio_play {
    position: relative;
    display: inline-block;
    padding: 0px 5px;
  }

  .video_play.selected, .audio_play.selected {
    background-color: rgb(233, 233, 235);
  }

  .popup-dropdown {
    position: absolute;
    display: block;
    background: #fff;
    top: 32px;
    left: -45px;
    min-width: 130px;
    z-index: 1600;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 4px;
    text-align: center;
    .dropdown-item:first-child {
        border-top-left-radius: 3px;
        border-top-right-radius: 3px;
    }
    .dropdown-item:last-child {
        border-bottom-left-radius: 3px;
        border-bottom-right-radius: 3px;
    }
    &.op-header {
        left: -30px;
        min-width: 90px;
    }
    &.fade-enter-active, &.fade-leave-active {
        opacity: 1;
    }
    &.fade-enter, &.fade-leave-active {
        opacity: 0;
    }
    &.transition {
      &, .dropdown-item {
        transition: all 0.2s linear 0s
      }
    }
  }
  .dropdown-item {
    height: 40px;
    line-height: 40px;
    font-size: 14px;
    color: #606266;
    position: relative;
    &:hover {
      color: #303133;
      background-color: #e9e9eb;
    }
    input {
      position: absolute;
      font-size: 100px;
      right: 0;
      top: 0;
      opacity: 0;
      cursor: pointer;
    }
  }

  .add-link-wrapper {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 1600;
      transition: all 0.1s linear 0s;
      &.fade-enter-active, &.fade-leave-active {
          opacity: 1;
      }
      &.fade-enter, &.fade-leave-active {
          opacity: 0;
      }
      .add-link {
          position: fixed;
          box-sizing: border-box;
          text-align: center;
          width: 24%;
          left: 38%;
          @media only screen and (max-width: 1500px) {
              width: 34%;
              left: 33%;
          }
          @media only screen and (max-width: 1000px) {
              width: 50%;
              left: 25%;
          }
          @media only screen and (max-width: 600px) {
              width: 80%;
              left: 10%;
          }
          height: auto;
          padding: 40px;
          top: 25%;
          transition: all 0.1s linear 0s;
          z-index: 3;
          background: #fff;
          border-radius: 2px;

          i {
              font-size: 24px;
              position: absolute;
              right: 8px;
              top: 6px;
              color: rgba(0, 0, 0, 0.7);
              cursor: pointer
          }
          .title {
              font-size: 20px;
              margin-bottom: 30px;
              margin-top: 10px;
              font-weight: 500 !important;
          }
          .input-wrapper {
              margin-top: 10px;
              width: 80%;
              border: 1px solid #eeece8;
              text-align: left;
              margin-left: 10%;
              height: 35px;
              input {
                  height: 32px;
                  line-height: 32px;
                  font-size: 15px;
                  width: 90%;
                  margin-left: 8px;
                  border: none;
                  outline: none;
              }
          }
          .op-btn {
              width: 100px;
              height: 35px;
              display: inline-block;
              margin-top: 30px;
              cursor: pointer;
              text-align: center;
              line-height: 35px;
              opacity: 0.9;
              border-radius: 2px;
              letter-spacing: 1px;
              font-size: 15px;
          }
          .op-btn.sure {
              background: #2185d0;
              color: #fff;
              margin-left: 5%;
              &:hover {
                  opacity: 1;
              }
          }
          .op-btn.cancel {
              border: 1px solid #bcbcbc;
              color: #bcbcbc;
              &:hover {
                  color: #000;
              }
          }
  
      }
  }

  .v-note-wrapper {
    z-index: 5;
  }
</style>

<script>
import ImageUploader from '../../models/ImageUploader';
import {toolbar_left_addlink} from 'mavon-editor/src/lib/toolbar_left_click.js'

export default {
  props: {
    value: {
      type: String,
      required: true,
    }
  },
  data() {
    const imageUploader = new ImageUploader();
    return {
      imageUploader,
      isUploading: false,
      videoDropDown: false,
      audioDropDown: false,
      linkDialog: false,
      linkType: 'link',
      linkText: '',
      linkAddr: '',
    }
  },
  methods: {
    $imgAdd(pos, $file) {
      this.isUploading = true;
      const ret = this.imageUploader.uploadImage($file).then(ret => {
        const url = ret.location;
        this.isUploading = false;

        this.$refs.md.$img2Url(pos, url);
      });
    },
    $linkAdd() {
      this.linkDialog = false;
      toolbar_left_addlink(this.linkType, this.linkText, this.linkAddr, this.$refs.md);
    },
    $mouseenter_video_dropdown() {
      this.videoDropDown = true;
    },
    $mouseleave_video_dropdown() {
      this.videoDropDown = false;
    },
    $mouseenter_audio_dropdown() {
      this.audioDropDown = true;
    },
    $mouseleave_audio_dropdown() {
      this.audioDropDown = false;
    },
    $addMedia($e) {
      this.isUploading = true;

      const ret = this.imageUploader.uploadImage($e.target.files[0]).then(ret => {
        const url = ret.location;
        this.isUploading = false;

        toolbar_left_addlink('media', '', url, this.$refs.md);
      });
    },
  }
}
</script>
