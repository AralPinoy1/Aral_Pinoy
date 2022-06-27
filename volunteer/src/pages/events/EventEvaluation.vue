<template>
  <div>
    <div class="py-5">
      <img
        :src="logo"
        style="width: 320px; height: 150px"
      >
    </div>

    <b-container>
      <b-row>
        <b-col cols="12">
          <b-overlay
            :show="isSubmittingEvaluation"
            rounded="sm"
          >
            <b-card
              class="mb-5"
              bg-variant="light"
              style="border-radius: 20px;"
            >
              <template v-if="!isFullyLoaded">
                <b-container style="height: 100vh">
                  <b-row
                    class="vh-100"
                    align-h="center"
                  >
                    <b-col
                      cols="12"
                      align-self="center"
                    >
                      <b-spinner style="width: 10rem; height: 10rem;" />
                    </b-col>
                  </b-row>
                </b-container>
              </template>

              <template v-else-if="!doesEventExist">
                <b-container>
                  <b-row
                    align-h="center"
                    style="height: 60vh"
                  >
                    <b-col
                      cols="12"
                      align-self="center"
                    >
                      <b-button @click="$router.go(-1)">
                        Go back
                      </b-button>
                    </b-col>
                  </b-row>
                </b-container>
              </template>

              <template v-else-if="!hasEventEnded">
                <b-container>
                  <b-row
                    align-h="center"
                    style="height: 60vh"
                  >
                    <b-col
                      cols="12"
                      align-self="center"
                    >
                      <h1 class="mb-5">
                        Event has not yet ended
                      </h1>

                      <b-button @click="$router.go(-1)">
                        Go back
                      </b-button>
                    </b-col>
                  </b-row>
                </b-container>
              </template>

              <template v-else-if="!isVolunteered || isAbsent">
                <b-container>
                  <b-row
                    align-h="center"
                    style="height: 60vh"
                  >
                    <b-col
                      cols="12"
                      align-self="center"
                    >
                      <h1 class="mb-5">
                        {{
                          isAbsent
                            ? 'You were absent to this event'
                            : 'You have not volunteered to this event'
                        }}
                      </h1>

                      <b-button @click="$router.go(-1)">
                        Go back
                      </b-button>
                    </b-col>
                  </b-row>
                </b-container>
              </template>

              <template v-else-if="!hasEventEvaluation">
                <div class="pb-3">
                  <h1 style="font-family:'Bebas Neue', cursive;">
                    {{ event.name }}
                  </h1>

                  <h4 style="font-family:'Bebas Neue', cursive;">
                    {{ event.location.name }}
                  </h4>

                  <h4 style="font-family:'Bebas Neue', cursive;">
                    {{
                      new Date(event.date.start).toLocaleString('en-us', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    }} -
                    {{
                      new Date(event.date.end).toLocaleString('en-us', {
                        dateStyle: 'medium',
                        timeStyle: 'short'
                      })
                    }}
                  </h4>
                </div>

                <b-container fluid>
                  <b-row v-if="universalQuestions.results.length > 0 || questionnaireAnswers.length > 0">
                    <b-col cols="12">
                      <b-card class="mb-4">
                        <b-container fluid>
                          <b-row>
                            <b-col cols="12">
                              <h2 style="font-family:'Bebas Neue', cursive; text-align: center;">
                                Event Questionnaire
                              </h2>
                            </b-col>
                          </b-row>

                          <b-row
                            v-for="(question, questionIndex) in event.questions"
                            :key="`question-${questionIndex}`"
                            style="text-align: left;"
                          >
                            <b-form-group
                              v-if="question.type === 'matrix'"
                              v-slot="{ ariaDescribedby }"
                              :label="question.label"
                            >
                              <b-col
                                class="mb-3"
                                cols="12"
                              >
                                <b-form-radio
                                  v-model="questionnaireAnswers[questionIndex]"
                                  :aria-describedby="ariaDescribedby"
                                  value="Very Satisfied"
                                >
                                  &nbsp;Very Satisfied
                                </b-form-radio>
                              </b-col>

                              <b-col
                                class="mb-3"
                                cols="12"
                              >
                                <b-form-radio
                                  v-model="questionnaireAnswers[questionIndex]"
                                  :aria-describedby="ariaDescribedby"
                                  value="Satisfied"
                                >
                                  &nbsp;Satisfied
                                </b-form-radio>
                              </b-col>

                              <b-col
                                class="mb-3"
                                cols="12"
                              >
                                <b-form-radio
                                  v-model="questionnaireAnswers[questionIndex]"
                                  :aria-describedby="ariaDescribedby"
                                  value="Neutral"
                                >
                                  &nbsp;Neutral
                                </b-form-radio>
                              </b-col>

                              <b-col
                                class="mb-3"
                                cols="12"
                              >
                                <b-form-radio
                                  v-model="questionnaireAnswers[questionIndex]"
                                  :aria-describedby="ariaDescribedby"
                                  value="Dissatisfied"
                                >
                                  &nbsp;Dissatisfied
                                </b-form-radio>
                              </b-col>

                              <b-col
                                class="mb-3"
                                cols="12"
                              >
                                <b-form-radio
                                  v-model="questionnaireAnswers[questionIndex]"
                                  :aria-describedby="ariaDescribedby"
                                  value="Very Dissatisfied"
                                >
                                  &nbsp;Very Dissatisfied
                                </b-form-radio>
                              </b-col>
                            </b-form-group>
                          </b-row>

                          <b-row
                            v-for="(question, questionIndex) in universalQuestions.results"
                            :key="`universal-question-${questionIndex}`"
                            class="my-5"
                            style="text-align: left;"
                          >
                            <matrix-satisfied-question
                              v-if="question.type === 'matrix:satisfied'"
                              :question="question"
                              @answer-updated="handleUniversalQuestionAnswer"
                            />
                            <matrix-likely-question
                              v-else-if="question.type === 'matrix:likely'"
                              :question="question"
                              @answer-updated="handleUniversalQuestionAnswer"
                            />
                          </b-row>
                        </b-container>
                      </b-card>
                    </b-col>
                  </b-row>

                  <b-row v-if="hasEventSdgs && sdgAnswers.length > 0">
                    <b-col cols="12">
                      <b-card class="mb-4">
                        <b-container fluid>
                          <b-row>
                            <b-col cols="12">
                              <h2 style="font-family:'Bebas Neue', cursive; text-align: center;">
                                SDG Evaluation Form
                              </h2>
                            </b-col>
                          </b-row>

                          <b-row>
                            <b-col
                              v-for="(sdg, sdgIndex) in event.sdgs"
                              :key="sdgIndex"
                              cols="12"
                            >
                              <b-card class="mb-3">
                                <b-container fluid>
                                  <b-row>
                                    <b-col cols="12">
                                      <h4 style="font-family:'Bebas Neue', cursive; text-align: left">
                                        {{ sdg.name }}
                                      </h4>
                                    </b-col>

                                    <b-col
                                      class="mb-3"
                                      cols="12"
                                      style="text-align: left"
                                    >
                                      <span>
                                        {{ sdg.description }}
                                      </span>
                                    </b-col>

                                    <b-col
                                      cols="12"
                                      style="text-align: left"
                                    >
                                      <b-row
                                        v-for="(question, questionIndex) in sdg.questions"
                                        :key="`${sdgIndex}-${questionIndex}`"
                                      >
                                        <b-form-group
                                          v-if="question.type === 'polar'"
                                          v-slot="{ ariaDescribedby }"
                                          :label="`${questionIndex + 1}. ${question.label}`"
                                        >
                                          <b-col
                                            class="mb-3"
                                            cols="12"
                                          >
                                            <b-form-radio
                                              v-model="sdgAnswers[sdgIndex][questionIndex]"
                                              :aria-describedby="ariaDescribedby"
                                              :value="1"
                                            >
                                              &nbsp;Yes
                                            </b-form-radio>
                                          </b-col>

                                          <b-col
                                            class="mb-3"
                                            cols="12"
                                          >
                                            <b-form-radio
                                              v-model="sdgAnswers[sdgIndex][questionIndex]"
                                              :aria-describedby="ariaDescribedby"
                                              :value="0"
                                            >
                                              &nbsp;No
                                            </b-form-radio>
                                          </b-col>
                                        </b-form-group>
                                      </b-row>
                                    </b-col>
                                  </b-row>
                                </b-container>
                              </b-card>
                            </b-col>
                          </b-row>
                        </b-container>
                      </b-card>
                    </b-col>
                  </b-row>

                  <b-card class="mb-4">
                    <b-container fluid>
                      <h4 style="font-family:'Bebas Neue', cursive; text-align: left;">
                        Recommendations and Comments
                      </h4>

                      <b-form-textarea
                        v-model="comment"
                        placeholder="Enter something..."
                        rows="10"
                        max-rows="6"
                      />
                    </b-container>
                  </b-card>

                  <b-button
                    pill
                    variant="danger"
                    style="margin: 12px; display: inline-block; font-size: 16px; padding: 8px; width: 225px;"
                    @click="confirmModal = true"
                  >
                    Submit
                  </b-button>
                </b-container>

                <b-modal
                  v-model="confirmModal"
                  @ok="submitEventEvaluation"
                  @cancel="confirmModal = false"
                >
                  <b-container>
                    <b-row>
                      <b-col cols="12">
                        <h5>
                          Are you sure with all the details?
                        </h5>
                      </b-col>
                    </b-row>
                  </b-container>
                </b-modal>
              </template>

              <template v-else>
                <b-container>
                  <b-row
                    align-h="center"
                    style="height: 60vh"
                  >
                    <b-col
                      cols="12"
                      align-self="center"
                    >
                      <h1 class="mb-5">
                        Thank you for your evaluation!
                      </h1>

                      <b-button @click="$router.go(-1)">
                        Go back
                      </b-button>
                    </b-col>
                  </b-row>
                </b-container>
              </template>
            </b-card>
          </b-overlay>
        </b-col>
      </b-row>
    </b-container>

    <br>

    <Footer />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import _ from 'lodash'

import Footer from '../../components/Footer'
import MatrixSatisfiedQuestion from '../../components/event-evaluation/MatrixSatisfiedQuestion'
import MatrixLikelyQuestion from '../../components/event-evaluation/MatrixLikelyQuestion'

import { apiClient } from '../../axios'
import EventQuestionRepository from '../../repositories/events/questions'
import EventEvaluationRepository from '../../repositories/events/evaluations'

const logo = require('../../assets/aralpinoywords.png')

export default {
  components: {
    Footer,
    MatrixSatisfiedQuestion,
    MatrixLikelyQuestion
  },
  data () {
    return {
      eventQuestionRepository: null,
      eventEvaluationRepository: null,
      logo,
      universalQuestions: {
        results: [],
        isLoading: false
      },
      answerMap: {
        universal: new Map()
      },
      isLoadingEvent: false,
      isLoadingEventVolunteer: false,
      event: null,
      eventVolunteer: null,
      eventEvaluation: null,
      sdgAnswers: [],
      questionnaireAnswers: [],
      comment: '',
      confirmModal: false,
      isSubmittingEvaluation: false
    }
  },
  computed: {
    ...mapGetters(['user', 'token']),
    eventId () {
      return this.$route.params.id
    },
    doesEventExist () {
      return this.event !== null
    },
    hasEventEnded () {
      return this.doesEventExist && this.event.status === 'ENDED'
    },
    hasEventSdgs () {
      if (!this.doesEventExist) {
        return false
      }

      return Array.isArray(this.event.sdgs) && this.event.sdgs.length > 0
    },
    hasEventQuestions () {
      if (!this.doesEventExist) {
        return false
      }

      return Array.isArray(this.event.questions) && this.event.questions.length > 0
    },
    isVolunteered () {
      return this.eventVolunteer !== null
    },
    isAbsent () {
      return this.isVolunteered && this.eventVolunteer.absent === true
    },
    hasEventEvaluation () {
      return this.isVolunteered && this.eventVolunteer.eventEvaluation !== undefined
    },
    isFullyLoaded () {
      return !this.isLoadingEvent && !this.isLoadingEventVolunteer
    }
  },
  async created () {
    this.eventQuestionRepository = new EventQuestionRepository(apiClient, {
      bearerToken: this.token
    })
    this.eventEvaluationRepository = new EventEvaluationRepository(apiClient, {
      bearerToken: this.token
    })

    await this.getEvent()

    if (!this.doesEventExist) {
      return
    }

    this.eventVolunteer = await this.getEventVolunteer()

    if (this.hasEventEvaluation) {
      return
    }

    if (this.event.goals.numVolunteers.target === 0) {
      return this.$router.push({
        path: `/events/${this.eventId}`
      })
    }

    this.formatForm()

    await this.loadUniversalQuestions()
  },
  methods: {
    async getEvent () {
      if (!this.eventId) {
        return
      }

      const eventId = this.eventId

      try {
        const { data } = await apiClient.get(`/events/${eventId}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        this.event = data
      } finally {
        this.isLoadingEvent = false
      }
    },
    async getEventVolunteer () {
      if (this.user === null) {
        return
      }

      this.isLoadingEventVolunteer = true

      const userId = this.user._id
      const eventId = this.eventId

      const queryString = new URLSearchParams()

      queryString.set('limit', 1)
      queryString.set('filters.userId', userId)
      queryString.set('filters.eventId', eventId)

      try {
        const { data } = await apiClient.get(`/event-volunteers?${queryString.toString()}`, {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        })

        if (data.total === 0) {
          return
        }

        return data.results[0]
      } finally {
        this.isLoadingEventVolunteer = false
      }
    },
    async loadUniversalQuestions () {
      this.universalQuestions.isLoading = true

      /** @type {EventQuestionRepository} */
      const eventQuestionRepository = this.eventQuestionRepository

      try {
        const { results } = await eventQuestionRepository.list({
          sort: {
            field: 'label',
            order: 'asc'
          }
        })

        this.universalQuestions.results = results
      } finally {
        this.universalQuestions.isLoading = true
      }
    },
    formatForm () {
      if (this.hasEventSdgs) {
        for (const sdg of this.event.sdgs) {
          const nullAnswers = Array(sdg.questions.length).fill(null)

          this.sdgAnswers.push(nullAnswers)
        }
      }

      if (this.hasEventQuestions) {
        const nullAnswers = Array(this.event.questions.length).fill(null)

        this.questionnaireAnswers.push(nullAnswers)
      }
    },
    handleUniversalQuestionAnswer (update) {
      const { question, answer } = update

      /** @type {Map<string, Object>} */
      const answerMap = this.answerMap.universal

      answerMap.set(question.label, {
        question,
        answer
      })
    },
    async submitEventEvaluation () {
      this.isSubmittingEvaluation = true

      const eventId = this.eventId
      const userId = this.user._id

      const prepayload = {
        sdgAnswers: undefined,
        universalQuestionnaireAnswers: undefined,
        questionnaireAnswers: undefined,
        comment: this.comment
      }

      if (this.sdgAnswers.length > 0) {
        prepayload.sdgAnswers = this.sdgAnswers
      }

      if (this.answerMap.universal.size > 0) {
        prepayload.universalQuestionnaireAnswers = Array.from(this.answerMap.universal.values())
      }

      if (this.questionnaireAnswers.length > 0) {
        prepayload.questionnaireAnswers = this.questionnaireAnswers
      }

      const evaluation = _.pickBy(prepayload, _.identity)

      /** @type {EventEvaluationRepository} */
      const eventEvaluationRepository = this.eventEvaluationRepository

      try {
        await eventEvaluationRepository.create({
          userId,
          eventId,
          evaluation
        })

        this.$router.go()
      } catch (error) {
        this.isSubmittingEvaluation = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans&display=swap');
</style>
