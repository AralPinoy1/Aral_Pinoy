<template>
  <div>
    <b-container class="py-5">
      <b-row>
        <b-col cols="12">
          <b-card
            class="card"
            style="border-radius: 20px;"
          >
            <b-container fluid>
              <b-row>
                <b-col cols="12">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    Event Questions
                  </h1>
                </b-col>

                <b-col cols="12">
                  <b-button
                    variant="success"
                    class="mx-3"
                    @click="showEventQuestionModal"
                  >
                    Add Event Question
                  </b-button>
                </b-col>

                <b-col
                  cols="12"
                  class="my-3"
                >
                  <b-skeleton-wrapper :loading="isFetchingEventQuestions">
                    <template #loading>
                      <b-card>
                        <b-skeleton width="85%" />
                        <b-skeleton width="55%" />
                        <b-skeleton width="70%" />
                      </b-card>

                      <b-card>
                        <b-skeleton width="85%" />
                        <b-skeleton width="55%" />
                        <b-skeleton width="70%" />
                      </b-card>

                      <b-card>
                        <b-skeleton width="85%" />
                        <b-skeleton width="55%" />
                        <b-skeleton width="70%" />
                      </b-card>
                    </template>

                    <b-list-group>
                      <b-list-group-item
                        v-for="eventQuestion in eventQuestions"
                        :key="eventQuestion._id"
                        class="flex-column align-items-start"
                        to="#"
                        style="text-align: left"
                      >
                        <div class="d-flex w-100 justify-content-between">
                          <div>
                            <div>
                              <h5 class="mb-1">
                                {{ eventQuestion.label }}
                              </h5>
                            </div>

                            <p class="mb-1 text-secondary">
                              {{ getEventQuestionTypeLabel(eventQuestion.type) }}
                            </p>
                          </div>

                          <button
                            class="btn btn-link"
                            type="button"
                            style="color: #dc3545"
                            @click.stop="showDeleteEventQuestionModal(eventQuestion._id)"
                          >
                            <b-icon icon="trash" />
                          </button>
                        </div>
                      </b-list-group-item>
                    </b-list-group>
                  </b-skeleton-wrapper>
                </b-col>
              </b-row>
            </b-container>
          </b-card>
        </b-col>
      </b-row>
    </b-container>

    <b-modal
      v-model="createModal.show"
      size="xl"
      hide-footer
    >
      <b-overlay :show="createModal.isCreating">
        <validation-observer v-slot="{ invalid }">
          <b-container fluid>
            <h1
              style="font-family:'Bebas Neue', cursive;"
              no-body
              class="text-center"
            >
              Add an Event Question
            </h1>

            <b-row class="my-1">
              <label
                for="input-event-question-label"
              >
                Label
              </label>

              <b-col>
                <validation-provider
                  v-slot="validationContext"
                  :rules="{
                    required: true,
                    max: 500
                  }"
                >
                  <b-form-input
                    id="input-event-question-label"
                    v-model="createModal.form.label"
                    :state="getValidationState(validationContext)"
                    aria-describedby="input-event-question-label-feedback"
                  />

                  <b-form-invalid-feedback id="input-event-question-label-feedback">
                    {{ validationContext.errors[0] }}
                  </b-form-invalid-feedback>
                </validation-provider>
              </b-col>
            </b-row>

            <b-row class="my-1">
              <label
                for="select-event-question-type"
              >
                Question Type
              </label>

              <b-col>
                <select
                  id="select-event-question-type"
                  v-model="createModal.form.type"
                  class="form-select"
                >
                  <option
                    v-for="type in eventQuestionTypes"
                    :key="type.value"
                    :value="type.value"
                  >
                    {{ type.label }}
                  </option>
                </select>
              </b-col>
            </b-row>

            <b-button
              pill
              variant="danger"
              style="margin: 12px; display: inline-block; font-size: 16px; padding: 8px; width: 225px;"
              :disabled="invalid || createModal.isCreating"
              @click="addEventQuestion"
            >
              Add Event Question
            </b-button>
          </b-container>
        </validation-observer>
      </b-overlay>
    </b-modal>

    <b-modal
      v-model="deleteModal.show"
      size="xl"
      @ok="deleteEventQuestion"
    >
      <b-container fluid>
        <h1 style="font-family:'Bebas Neue', cursive; text-align:center;">
          Are you sure you want to delete this event question?
        </h1>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { ValidationObserver, ValidationProvider, extend } from 'vee-validate'
import { required, max } from 'vee-validate/dist/rules'

import validationMixins from '../../../mixins/validation'

import EventQuestionRepository from '../../../repositories/events/questions'
import { apiClient } from '../../../axios'

extend('required', {
  ...required,
  message: 'This field is required'
})
extend('max', {
  ...max,
  message: 'This field must be less than or equal to {length} characters'
})

const eventQuestionRepository = new EventQuestionRepository(apiClient)

const EVENT_QUESTION_TYPE_LABEL = {
  polar: 'Polar - Yes/No',
  'matrix:satisfied': 'Matrix - Very Satisfied/Dissatisfied',
  'matrix:likely': 'Matrix - Very Likely/Unlikely'
}

export default {
  name: 'EventQuestionList',
  components: {
    ValidationObserver,
    ValidationProvider
  },
  mixins: [
    validationMixins
  ],
  data () {
    return {
      isFetchingEventQuestions: false,
      eventQuestions: [],
      eventQuestionTypes: [
        {
          label: 'Polar - Yes/No',
          value: 'polar'
        },
        {
          label: 'Matrix - Very Satisfied/Dissatisfied',
          value: 'matrix:satisfied'
        },
        {
          label: 'Matrix - Very Likely/Unlikely',
          value: 'matrix:likely'
        }
      ],
      createModal: {
        show: false,
        isCreating: false,
        form: {
          label: '',
          type: ''
        }
      },
      deleteModal: {
        eventQuestionIdToDelete: null,
        show: false,
        isDeleting: false
      }
    }
  },
  computed: {
    ...mapGetters(['token'])
  },
  created () {
    eventQuestionRepository.setAuthorizationHeader(`Bearer ${this.token}`)

    this.getEventQuestions()
  },
  methods: {
    async getEventQuestions () {
      const { results } = await eventQuestionRepository.list()

      this.eventQuestions = results
    },
    getEventQuestionTypeLabel (type) {
      const label = EVENT_QUESTION_TYPE_LABEL[type]

      return label !== undefined ? label : ''
    },
    showEventQuestionModal () {
      this.createModal.show = true
    },
    showDeleteEventQuestionModal (eventQuestionIdToDelete) {
      this.deleteModal.eventQuestionIdToDelete = eventQuestionIdToDelete
      this.deleteModal.show = true
    },
    async addEventQuestion () {
      const {
        label,
        type
      } = this.createModal.form

      this.createModal.isCreating = true

      await eventQuestionRepository.create({
        label,
        type
      })

      this.$router.go()
    },
    async deleteEventQuestion () {
      const eventQuestionIdToDelete = this.deleteModal.eventQuestionIdToDelete

      if (eventQuestionIdToDelete === null) {
        return
      }

      this.deleteModal.isDeleting = true

      await eventQuestionRepository.deleteEventQuestion(this.deleteModal.eventQuestionIdToDelete)

      this.$router.go()
    }
  }
}
</script>
