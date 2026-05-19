import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from 'boot/supabase'

const DEFAULT_CHIP = '#26a69a'

export const useMembersStore = defineStore('members', () => {
  const members = ref([])

  async function fetchMembers () {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('user_id, show_name, auth_user_id, chip_color')
      .order('show_name')
    if (error) throw error
    members.value = data || []
  }

  function findByResponsibleId (id) {
    if (!id) return null
    return (
      members.value.find((x) => x.user_id === id) ||
      members.value.find((x) => x.auth_user_id === id) ||
      null
    )
  }

  function nameForMemberId (memberId) {
    return findByResponsibleId(memberId)?.show_name || ''
  }

  function nameForResponsible (id) {
    if (!id) return ''
    return findByResponsibleId(id)?.show_name || '（未命名）'
  }

  function chipColorForResponsible (id) {
    const m = findByResponsibleId(id)
    return m?.chip_color || DEFAULT_CHIP
  }

  const allMembers = () => members.value

  return {
    members,
    fetchMembers,
    nameForMemberId,
    nameForResponsible,
    chipColorForResponsible,
    allMembers
  }
})
