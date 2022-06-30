<template>
  <div>
    <b-card style="border-radius: 20px;">
      <h1
        class="text-start"
        style="font-family:'Bebas Neue', cursive;"
      >
        Actions
      </h1>

      <b-row>
        <b-col cols="12">
          <b-list-group style="text-align: left">
            <b-list-group-item class="mb-4 flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between">
                <div>
                  <h5 class="mb-1">
                    Invite volunteers
                  </h5>

                  <p class="mb-1">
                    Volunteers are invited to the event for them to participate.
                  </p>
                </div>

                <button
                  class="btn btn-danger"
                  type="button"
                  style="width: 10%"
                  @click="showVolunteerInvitationModal"
                >
                  Invite
                </button>
              </div>
            </b-list-group-item>

            <b-list-group-item
              v-if="Array.isArray(event.ikds) && event.ikds.length > 0"
              class="mb-4 flex-column align-items-start"
            >
              <div class="d-flex w-100 justify-content-between">
                <div>
                  <h5 class="mb-1">
                    Inventory Checklist Form
                  </h5>

                  <p class="mb-1">
                    Download the form for the inventory item checklist.
                  </p>
                </div>

                <button
                  class="btn btn-danger"
                  type="button"
                  style="width: 10%"
                  @click="downloadInventoryListForm"
                >
                  Download
                </button>
              </div>
            </b-list-group-item>

            <b-list-group-item class="mb-4 flex-column align-items-start">
              <div class="d-flex w-100 justify-content-between">
                <div>
                  <h5 class="mb-1">
                    Expense Breakdown Form
                  </h5>

                  <p class="mb-1">
                    Download the form for listing the event expense breakdown.
                  </p>
                </div>

                <button
                  class="btn btn-danger"
                  type="button"
                  style="width: 10%"
                  @click="downloadExpenseBreakdownForm"
                >
                  Download
                </button>
              </div>
            </b-list-group-item>

            <b-list-group-item
              v-if="event.goals.numVolunteers.current > 0"
              class="mb-4 flex-column align-items-start"
            >
              <div class="d-flex w-100 justify-content-between">
                <div>
                  <h5 class="mb-1">
                    Volunteer Attendance Form
                  </h5>

                  <p class="mb-1">
                    Download the form for checking the volunteer attendance.
                  </p>
                </div>

                <button
                  class="btn btn-danger"
                  type="button"
                  style="width: 10%"
                  @click="downloadVolunteerAttendanceForm"
                >
                  Download
                </button>
              </div>
            </b-list-group-item>
          </b-list-group>
        </b-col>
      </b-row>
    </b-card>

    <b-modal
      v-model="volunteerInvitation.modal"
      size="xl"
      title="Invite Volunteers"
      hide-footer
    >
      <b-container v-if="event !== null">
        <b-alert
          :show="!!volunteerInvitation.message"
          variant="primary"
        >
          {{ volunteerInvitation.message }}
        </b-alert>

        <b-row class="mb-3">
          <b-col cols="12">
            <b-card
              class="mb-3"
              header="Recommendation"
            >
              <b-row>
                <b-col
                  cols="12"
                  md="4"
                >
                  <div class="pb-3">
                    Filter by Skills
                  </div>

                  <b-form-tags>
                    <template>
                      <ul
                        class="list-inline d-inline-block mb-2"
                      >
                        <li
                          v-for="(skill, index) in volunteerInvitation.recommendedVolunteers.filters.skills"
                          :key="index"
                          class="list-inline-item"
                        >
                          <b-form-tag
                            class="bg-success"
                            @remove="removeSkill(index)"
                          >
                            {{ skill.name }}
                          </b-form-tag>
                        </li>
                      </ul>
                    </template>

                    <b-dropdown
                      text="Add Skill"
                      style="width: 100%"
                      menu-class="w-100"
                      variant="primary"
                    >
                      <b-dropdown-form>
                        <b-form-group
                          label="Search Skill"
                          label-for="skill-search"
                          @submit.stop.prevent
                        >
                          <b-form-input
                            id="skill-search"
                            debounce="500"
                            @update="searchSkills"
                          />
                        </b-form-group>
                      </b-dropdown-form>
                      <b-dropdown-divider />

                      <b-dropdown-item
                        v-for="skill in volunteerInvitation.recommendedVolunteers.filterOptions.skillOptions"
                        :key="skill._id"
                        @click="selectSkill(skill)"
                      >
                        {{ skill.name }} <span style="color: grey; font-size: 12px">{{ skill.description }}</span>
                      </b-dropdown-item>
                    </b-dropdown>
                  </b-form-tags>
                </b-col>

                <b-col
                  cols="12"
                  md="4"
                >
                  <div class="pb-3">
                    Filter by Province
                  </div>

                  <b-form-tags>
                    <template>
                      <ul
                        class="list-inline d-inline-block mb-2"
                      >
                        <li
                          v-for="(province, index) in volunteerInvitation.recommendedVolunteers.filters.provinces"
                          :key="index"
                          class="list-inline-item"
                        >
                          <b-form-tag
                            class="bg-success"
                            @remove="removeProvince(index)"
                          >
                            {{ province }}
                          </b-form-tag>
                        </li>
                      </ul>
                    </template>

                    <b-dropdown
                      text="Add Province"
                      style="width: 100%"
                      menu-class="w-100"
                      variant="primary"
                    >
                      <b-dropdown-form>
                        <select
                          class="form-select"
                          @change="(e) => selectProvince(e.target.value)"
                        >
                          <option selected />

                          <option
                            v-for="province in philippineProvinces"
                            :key="province"
                            :value="province"
                          >
                            {{ province }}
                          </option>
                        </select>
                      </b-dropdown-form>
                    </b-dropdown>
                  </b-form-tags>
                </b-col>

                <b-col
                  cols="12"
                  md="4"
                >
                  <div class="pb-3">
                    Filter by City
                  </div>

                  <b-form-tags>
                    <template>
                      <ul
                        class="list-inline d-inline-block mb-2"
                      >
                        <li
                          v-for="(city, index) in volunteerInvitation.recommendedVolunteers.filters.cities"
                          :key="index"
                          class="list-inline-item"
                        >
                          <b-form-tag
                            class="bg-success"
                            @remove="removeCity(index)"
                          >
                            {{ city }}
                          </b-form-tag>
                        </li>
                      </ul>
                    </template>

                    <b-dropdown
                      text="Add City"
                      style="width: 100%"
                      menu-class="w-100"
                      variant="primary"
                    >
                      <b-dropdown-form>
                        <select
                          class="form-select"
                          @change="(e) => selectCity(e.target.value)"
                        >
                          <option selected />

                          <option
                            v-for="city in volunteerInvitation.recommendedVolunteers.filterOptions.cityOptions"
                            :key="city"
                            :value="city"
                          >
                            {{ city }}
                          </option>
                        </select>
                      </b-dropdown-form>
                    </b-dropdown>
                  </b-form-tags>
                </b-col>
              </b-row>

              <b-row class="pt-4">
                <b-col cols="12">
                  <b-table
                    ref="recommendedVolunteersTable"
                    :items="getRecommendedVolunteers"
                    :fields="volunteerInvitation.recommendedVolunteers.fields"
                    :current-page="volunteerInvitation.recommendedVolunteers.pagination.currentPage"
                    :per-page="volunteerInvitation.recommendedVolunteers.pagination.perPage"
                    stacked="md"
                    style="background:white"
                    show-empty
                    small
                    primary-key="_id"
                    hover
                  >
                    <template #cell(location)="{ item }">
                      <span v-if="item.location !== undefined">
                        {{ item.location.city }}, {{ item.location.province }}
                      </span>
                    </template>

                    <template #cell(skills)="{ value }">
                      <span
                        v-for="skill in value"
                        :key="skill._id"
                        class="badge bg-secondary mx-1"
                      >
                        {{ skill.name }}
                      </span>
                    </template>

                    <template #cell(invite)="{ item }">
                      <b-form-group class="pt-2 text-start">
                        <div class="form-check">
                          <input
                            id="recommended-volunteer-invite-checkbox"
                            class="form-check-input"
                            type="checkbox"
                            @change="(e) => handleVolunteerInvite(item, e.target.checked)"
                          >
                        </div>
                      </b-form-group>
                    </template>
                  </b-table>
                </b-col>
              </b-row>

              <b-row class="pt-4 justify-content-md-center">
                <b-col
                  cols="6"
                  class="my-1"
                >
                  <b-pagination
                    v-model="volunteerInvitation.recommendedVolunteers.pagination.currentPage"
                    :total-rows="volunteerInvitation.recommendedVolunteers.total"
                    :per-page="volunteerInvitation.recommendedVolunteers.pagination.perPage"
                    align="fill"
                    size="sm"
                    class="my-0"
                  />
                </b-col>
              </b-row>
            </b-card>

            <b-card header="Invitation List">
              <b-list-group class="mb-3">
                <div class="mb-4">
                  Total Invitations: {{ volunteerInvitation.userInvitations.length }}
                </div>
                <div class="mb-4">
                  Volunteers Needed For Event:
                  {{
                    (event.goals.numVolunteers.target - event.goals.numVolunteers.current) >= 0 ?
                      event.goals.numVolunteers.target - event.goals.numVolunteers.current :
                      0
                  }}
                </div>

                <b-dropdown
                  text="Add a Volunteer"
                  style="width: 100%"
                  menu-class="w-100"
                  variant="primary"
                  class="mb-4"
                  no-flip
                >
                  <b-dropdown-form>
                    <b-form-group
                      label="Search Volunteer"
                      label-for="user-invitation-search-input"
                      @submit.stop.prevent
                    >
                      <b-form-input
                        id="user-invitation-search-input"
                        debounce="250"
                        @update="searchUsersForInvitation"
                      />
                    </b-form-group>
                  </b-dropdown-form>

                  <b-dropdown-divider />

                  <b-dropdown-item
                    v-for="user in userOptions"
                    :key="user._id"
                    @click="handleVolunteerInvite(user, true)"
                  >
                    {{ user.lastName }}, {{ user.firstName }} <span style="color: grey; font-size: 12px">{{ user.email }}</span>
                  </b-dropdown-item>
                </b-dropdown>

                <b-list-group-item
                  v-for="(user, index) in volunteerInvitation.userInvitations"
                  :key="user._id"
                  class="d-flex justify-content-between align-items-center"
                >
                  <div>
                    {{ user.lastName }}, {{ user.firstName }} <span style="color: grey; font-size: 12px">{{ user.email }}</span>
                  </div>

                  <b-button
                    variant="danger"
                    @click="removeUserFromInvitation(index)"
                  >
                    <b-icon icon="trash" />
                  </b-button>
                </b-list-group-item>
              </b-list-group>
            </b-card>
          </b-col>
        </b-row>

        <b-row
          align-h="end"
          align-v="center"
        >
          <b-col cols="2">
            <button
              class="btn btn-success"
              :disabled="volunteerInvitation.userInvitations.length === 0"
              @click="inviteVolunteers"
            >
              <b-spinner
                v-if="volunteerInvitation.isInviting"
                style="width: 1rem; height: 1rem;"
              />

              <template v-else>
                Submit
              </template>
            </button>
          </b-col>
        </b-row>
      </b-container>
    </b-modal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { intersection } from 'lodash'

import { apiClient } from '../../axios'
import EventRepository from '../../repositories/events'
import UserRepository from '../../repositories/users'
import SkillRepository from '../../repositories/skills'

import EventFormRepository from '../../repositories/events/forms'

import { provinceCityMap } from '../../constants/philippines'

const eventRepository = new EventRepository(apiClient)
const userRepository = new UserRepository(apiClient)
const skillRepository = new SkillRepository(apiClient)

function downloadFileAsLink (file, filename) {
  const url = window.URL.createObjectURL(new Blob([file]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
}

export default {
  name: 'EventDetailsActionsCard',
  props: {
    event: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      eventFormRepository: null,
      volunteerInvitation: {
        modal: false,
        message: '',
        isInviting: false,
        recommendedVolunteers: {
          results: [],
          total: 0,
          pagination: {
            perPage: 10,
            currentPage: 1
          },
          fields: [
            { key: 'email', label: 'Email' },
            { key: 'lastName', label: 'Last Name' },
            { key: 'firstName', label: 'First Name' },
            { key: 'location', label: 'Location' },
            { key: 'skills', label: 'Skills' },
            { key: 'invite', label: 'Invite' }
          ],
          loading: {
            searchSkills: false
          },
          filters: {
            skills: [],
            provinces: [],
            cities: []
          },
          filterOptions: {
            skillOptions: [],
            provinceOptions: [],
            cityOptions: []
          }
        },
        userInvitations: []
      },
      userOptions: []
    }
  },
  computed: {
    ...mapGetters(['token']),
    philippineProvinces () {
      return Object.keys(provinceCityMap).sort()
    },
    eventId () {
      return this.event._id
    }
  },
  watch: {
    'volunteerInvitation.recommendedVolunteers.filters.provinces' (provinces) {
      const cityOptionsSet = new Set()

      for (const province of provinces) {
        const citiesMap = provinceCityMap[province]

        if (citiesMap !== undefined) {
          Object.keys(citiesMap).forEach(cityOptionsSet.add, cityOptionsSet)
        }
      }

      const cityOptions = Array.from(cityOptionsSet)

      this.volunteerInvitation.recommendedVolunteers.filters.cities = intersection(
        this.volunteerInvitation.recommendedVolunteers.filters.cities,
        cityOptions
      )

      this.volunteerInvitation.recommendedVolunteers.filterOptions.cityOptions = cityOptions.sort()
    }
  },
  async created () {
    const authHeader = `Bearer ${this.token}`

    eventRepository.setAuthorizationHeader(authHeader)
    userRepository.setAuthorizationHeader(authHeader)
    skillRepository.setAuthorizationHeader(authHeader)

    this.eventFormRepository = new EventFormRepository(apiClient, {
      bearerToken: this.token
    })
  },
  methods: {
    async getRecommendedVolunteers (ctx) {
      const eventId = this.event._id
      const skills = this.volunteerInvitation.recommendedVolunteers.filters.skills
      const provinces = this.volunteerInvitation.recommendedVolunteers.filters.provinces
      const cities = this.volunteerInvitation.recommendedVolunteers.filters.cities

      const perPage = this.volunteerInvitation.recommendedVolunteers.pagination.perPage
      const pageOffset = (this.volunteerInvitation.recommendedVolunteers.pagination.currentPage - 1) * this.volunteerInvitation.recommendedVolunteers.pagination.perPage

      const { results, total } = await eventRepository.getRecommendedVolunteers({
        eventId,
        skills,
        location: {
          provinces,
          cities
        }
      }, {
        limit: perPage,
        offset: pageOffset
      })

      this.volunteerInvitation.recommendedVolunteers.total = total

      return results
    },
    showVolunteerInvitationModal () {
      this.volunteerInvitation.modal = true
    },
    async searchUsersForInvitation (value) {
      const { results } = await userRepository.list({
        name: value,
        roles: ['volunteer']
      }, {
        limit: 10,
        offset: 0
      })

      this.userOptions = results
    },
    handleVolunteerInvite (volunteer, isInvited) {
      const existingVolunteerIndex = this.volunteerInvitation.userInvitations.findIndex((item) => item._id === volunteer._id)

      if (isInvited) {
        if (existingVolunteerIndex === -1) {
          this.volunteerInvitation.userInvitations.push(volunteer)
        }
      } else {
        if (existingVolunteerIndex !== -1) {
          this.volunteerInvitation.userInvitations.splice(existingVolunteerIndex, 1)
        }
      }
    },
    removeUserFromInvitation (index) {
      this.volunteerInvitation.userInvitations.splice(index, 1)
    },
    async inviteVolunteers () {
      this.volunteerInvitation.isInviting = true
      this.volunteerInvitation.message = ''

      const eventId = this.event._id
      const userIds = this.volunteerInvitation.userInvitations.map((user) => user._id)

      try {
        await eventRepository.inviteVolunteers(eventId, userIds)

        this.volunteerInvitation.message = 'Volunteers have been invited!'
      } catch (error) {
        // TODO: Add error handling
      } finally {
        this.volunteerInvitation.isInviting = false
      }
    },
    async searchSkills (value) {
      const { results } = await skillRepository.list({
        name: value
      }, {
        limit: 10,
        offset: 0,
        sort: {
          field: 'name',
          order: 'asc'
        }
      })

      this.volunteerInvitation.recommendedVolunteers.filterOptions.skillOptions = results
    },
    selectSkill (skill) {
      const skills = this.volunteerInvitation.recommendedVolunteers.filters.skills

      for (const existingSkill of skills) {
        if (existingSkill._id === skill._id) {
          return
        }
      }

      skills.push(skill)

      this.$refs.recommendedVolunteersTable.refresh()
    },
    removeSkill (index) {
      const skills = this.volunteerInvitation.recommendedVolunteers.filters.skills

      skills.splice(index, 1)

      this.$refs.recommendedVolunteersTable.refresh()
    },
    selectProvince (province) {
      const provinces = this.volunteerInvitation.recommendedVolunteers.filters.provinces

      if (provinces.includes(province)) {
        return
      }

      provinces.push(province)

      this.$refs.recommendedVolunteersTable.refresh()
    },
    removeProvince (index) {
      const provinces = this.volunteerInvitation.recommendedVolunteers.filters.provinces

      provinces.splice(index, 1)

      this.$refs.recommendedVolunteersTable.refresh()
    },
    selectCity (city) {
      const cities = this.volunteerInvitation.recommendedVolunteers.filters.cities

      if (cities.includes(city)) {
        return
      }

      cities.push(city)

      this.$refs.recommendedVolunteersTable.refresh()
    },
    removeCity (index) {
      const cities = this.volunteerInvitation.recommendedVolunteers.filters.cities

      cities.splice(index, 1)

      this.$refs.recommendedVolunteersTable.refresh()
    },
    async downloadInventoryListForm () {
      const eventId = this.eventId

      /** @type {EventFormRepository} */
      const eventFormRepository = this.eventFormRepository

      const file = await eventFormRepository.downloadInventoryListFile(eventId)

      downloadFileAsLink(file, `inventory_list_${eventId}.pdf`)
    },
    async downloadExpenseBreakdownForm () {
      const eventId = this.eventId

      /** @type {EventFormRepository} */
      const eventFormRepository = this.eventFormRepository

      const file = await eventFormRepository.downloadExpenseBreakdownFile(eventId)

      downloadFileAsLink(file, `expense_breakdown_${eventId}.pdf`)
    },
    async downloadVolunteerAttendanceForm () {
      const eventId = this.eventId

      /** @type {EventFormRepository} */
      const eventFormRepository = this.eventFormRepository

      const file = await eventFormRepository.downloadVolunteerAttendanceFile(eventId)

      downloadFileAsLink(file, `volunteer_attendance_${eventId}.pdf`)
    }
  }
}
</script>
