var version = 1.2;
var server = null;
// server = "https://js1.jsflux.co.kr/janus"; //jsflux janus server url
server = 'https://janus.jsflux.co.kr/janus'; //jsflux janus server url

var janus = null;
var sfutest = null;
var opaqueId = 'videoroomtest-' + Janus.randomString(12);

// 실제 Janus 방은 데모 안정성을 위해 고정
var myroom = 1234; // Demo room (고정)

// 사용자가 입력한 "상담방 코드(DB roomCode)"는 이 값으로만 저장(메모 식별용)
var myroomCodeRaw = null;

//if (getQueryStringValue('room') !== '') myroom = parseInt(getQueryStringValue('room'));

//5자 입장코드 허용
function roomCodeToRoomId(roomCode) {
	var raw = (roomCode || '').trim().toUpperCase();

	// 숫자 방번호 그대로 허용
	if (/^\d+$/.test(raw)) return Number(raw);

	// 5자 영문+숫자 코드 허용 (예: A1B2C)
	if (/^[A-Z0-9]{5}$/.test(raw)) return parseInt(raw, 36);

	return null;
}

if (getQueryStringValue('room') !== '') {
	var rid = roomCodeToRoomId(getQueryStringValue('room'));
	if (rid != null) myroom = rid;
}
var myusername = null;
var myid = null;
var mystream = null;
var mypvtid = null;

var feeds = [];
var bitrateTimer = [];

var doSimulcast = getQueryStringValue('simulcast') === 'yes' || getQueryStringValue('simulcast') === 'true';
var doSimulcast2 = getQueryStringValue('simulcast2') === 'yes' || getQueryStringValue('simulcast2') === 'true';
var subscriber_mode =
	getQueryStringValue('subscriber-mode') === 'yes' || getQueryStringValue('subscriber-mode') === 'true';

$(document).ready(function () {
	// Initialize the library (all console debuggers enabled)
	Janus.init({
		debug: 'all',
		callback: function () {
			// Use a button to start the demo
			$('#start').one('click', function () {
				$(this).attr('disabled', true).unbind('click');
				// Make sure the browser supports WebRTC
				if (!Janus.isWebrtcSupported()) {
					bootbox.alert('No WebRTC support... ');
					return;
				}
				// Create session
				janus = new Janus({
					server: server,
					success: function () {
						// Attach to VideoRoom plugin
						janus.attach({
							plugin: 'janus.plugin.videoroom',
							opaqueId: opaqueId,
							success: function (pluginHandle) {
								$('#details').remove();
								sfutest = pluginHandle;
								Janus.log('Plugin attached! (' + sfutest.getPlugin() + ', id=' + sfutest.getId() + ')');
								Janus.log('  -- This is a publisher/manager');
								// Prepare the username registration
								$('#videojoin').removeClass('hide').show();
								$('#registernow').removeClass('hide').show();
								$('#register').click(registerUsername);
								$('#roomname').focus();
								$('#start')
									.removeAttr('disabled')
									.html('Stop')
									.click(function () {
										$(this).attr('disabled', true);
										janus.destroy();
									});

								Janus.log('Room List > ');
								//roomList();
							},
							error: function (error) {
								Janus.error('  -- Error attaching plugin...', error);
								bootbox.alert('Error attaching plugin... ' + error);
							},
							consentDialog: function (on) {
								Janus.debug('Consent dialog should be ' + (on ? 'on' : 'off') + ' now');
								if (on) {
									// Darken screen and show hint
									$.blockUI({
										message: '<div><img src="up_arrow.png"/></div>',
										css: {
											border: 'none',
											padding: '15px',
											backgroundColor: 'transparent',
											color: '#aaa',
											top: '10px',
											left: navigator.mozGetUserMedia ? '-100px' : '300px',
										},
									});
								} else {
									// Restore screen
									$.unblockUI();
								}
							},
							iceState: function (state) {
								Janus.log('ICE state changed to ' + state);
							},
							mediaState: function (medium, on) {
								Janus.log('Janus ' + (on ? 'started' : 'stopped') + ' receiving our ' + medium);
							},
							webrtcState: function (on) {
								Janus.log('Janus says our WebRTC PeerConnection is ' + (on ? 'up' : 'down') + ' now');
								$('#videolocal').parent().parent().unblock();
								if (!on) return;
								$('#publish').remove();
								// This controls allows us to override the global room bitrate cap
								$('#bitrate').parent().parent().removeClass('hide').show();
								$('#bitrate a').click(function () {
									var id = $(this).attr('id');
									var bitrate = parseInt(id) * 1000;
									if (bitrate === 0) {
										Janus.log('Not limiting bandwidth via REMB');
									} else {
										Janus.log('Capping bandwidth to ' + bitrate + ' via REMB');
									}
									$('#bitrateset')
										.html($(this).html() + '<span class="caret"></span>')
										.parent()
										.removeClass('open');
									sfutest.send({
										message: { request: 'configure', bitrate: bitrate },
									});
									return false;
								});
							},
							onmessage: function (msg, jsep) {
								Janus.debug(' ::: Got a message (publisher) :::', msg);
								var event = msg['videoroom'];
								Janus.debug('Event: ' + event);
								if (event) {
									if (event === 'joined') {
										if (getQueryStringValue('room') !== '')
											// Publisher/manager created, negotiate WebRTC and attach to existing feeds, if any
											myid = msg['id'];
										mypvtid = msg['private_id'];
										Janus.log('Successfully joined room ' + msg['room'] + ' with ID ' + myid);
										if (subscriber_mode) {
											$('#videojoin').hide();
											$('#videos').removeClass('hide').show();
										} else {
											publishOwnFeed(true);
										}

										try {
											if (window.parent && window.parent !== window) {
												window.parent.postMessage(
													{
														type: 'COUNSEL_ROOMCODE',
														roomCode: myroomCodeRaw, // 부모는 이걸로 메모 묶음
														roomId: myroom, // 참고용
													},
													window.location.origin
												);
											}
										} catch (e) {
											console.warn('postMessage failed', e);
										}
										// Any new feed to attach to?
										if (msg['publishers']) {
											var list = msg['publishers'];
											Janus.debug('Got a list of available publishers/feeds:', list);
											for (var f in list) {
												var id = list[f]['id'];
												var display = list[f]['display'];
												var audio = list[f]['audio_codec'];
												var video = list[f]['video_codec'];
												Janus.debug('  >> [' + id + '] ' + display + ' (audio: ' + audio + ', video: ' + video + ')');
												newRemoteFeed(id, display, audio, video);
											}
										}
									} else if (event === 'destroyed') {
										// The room has been destroyed
										Janus.warn('The room has been destroyed!');
										bootbox.alert('The room has been destroyed', function () {
											window.location.reload();
										});
									} else if (event === 'event') {
										// Any new feed to attach to?
										if (msg['publishers']) {
											var list = msg['publishers'];
											Janus.debug('Got a list of available publishers/feeds:', list);
											for (var f in list) {
												var id = list[f]['id'];
												var display = list[f]['display'];
												var audio = list[f]['audio_codec'];
												var video = list[f]['video_codec'];
												Janus.debug('  >> [' + id + '] ' + display + ' (audio: ' + audio + ', video: ' + video + ')');
												newRemoteFeed(id, display, audio, video);
											}
										} else if (msg['leaving']) {
											// One of the publishers has gone away?
											var leaving = msg['leaving'];
											Janus.log('Publisher left: ' + leaving);
											var remoteFeed = null;
											for (var i = 1; i < 6; i++) {
												if (feeds[i] && feeds[i].rfid == leaving) {
													remoteFeed = feeds[i];
													break;
												}
											}
											if (remoteFeed != null) {
												Janus.debug(
													'Feed ' + remoteFeed.rfid + ' (' + remoteFeed.rfdisplay + ') has left the room, detaching'
												);
												$('#remote' + remoteFeed.rfindex)
													.empty()
													.hide();
												$('#videoremote' + remoteFeed.rfindex).empty();
												feeds[remoteFeed.rfindex] = null;
												remoteFeed.detach();
											}
										} else if (msg['unpublished']) {
											// One of the publishers has unpublished?
											var unpublished = msg['unpublished'];
											Janus.log('Publisher left: ' + unpublished);
											if (unpublished === 'ok') {
												// That's us
												sfutest.hangup();
												return;
											}
											var remoteFeed = null;
											for (var i = 1; i < 6; i++) {
												if (feeds[i] && feeds[i].rfid == unpublished) {
													remoteFeed = feeds[i];
													break;
												}
											}
											if (remoteFeed != null) {
												Janus.debug(
													'Feed ' + remoteFeed.rfid + ' (' + remoteFeed.rfdisplay + ') has left the room, detaching'
												);
												$('#remote' + remoteFeed.rfindex)
													.empty()
													.hide();
												$('#videoremote' + remoteFeed.rfindex).empty();
												feeds[remoteFeed.rfindex] = null;
												remoteFeed.detach();
											}
										} else if (msg['error']) {
											if (msg['error_code'] === 426) {
												// This is a "no such room" error: give a more meaningful description
												bootbox.alert(
													'<p>Apparently room <code>' +
														myroom +
														'</code> (the one this demo uses as a test room) ' +
														'does not exist...</p><p>Do you have an updated <code>janus.plugin.videoroom.jcfg</code> ' +
														'configuration file? If not, make sure you copy the details of room <code>' +
														myroom +
														'</code> ' +
														'from that sample in your current configuration file, then restart Janus and try again.'
												);
											} else {
												bootbox.alert(msg['error']);
											}
										}
									}
								}
								if (jsep) {
									Janus.debug('Handling SDP as well...', jsep);
									sfutest.handleRemoteJsep({ jsep: jsep });
									// Check if any of the media we wanted to publish has
									// been rejected (e.g., wrong or unsupported codec)
									var audio = msg['audio_codec'];
									if (mystream && mystream.getAudioTracks() && mystream.getAudioTracks().length > 0 && !audio) {
										// Audio has been rejected
										toastr.warning("Our audio stream has been rejected, viewers won't hear us");
									}
									var video = msg['video_codec'];
									if (mystream && mystream.getVideoTracks() && mystream.getVideoTracks().length > 0 && !video) {
										// Video has been rejected
										toastr.warning("Our video stream has been rejected, viewers won't see us");
										// Hide the webcam video
										$('#myvideo').hide();
										$('#videolocal').append(
											'<div class="no-video-container">' +
												'<i class="fa fa-video-camera fa-5 no-video-icon" style="height: 100%;"></i>' +
												'<span class="no-video-text" style="font-size: 16px;">Video rejected, no webcam</span>' +
												'</div>'
										);
									}
								}
							},
							onlocalstream: function (stream) {
								mystream = stream;
								$('#videojoin').hide();
								$('#videos').removeClass('hide').show();

								// ✅ video는 videolocal에 계속 붙임
								if ($('#myvideo').length === 0) {
									$('#videolocal').append(
										'<video class="rounded centered" id="myvideo" autoplay playsinline muted="muted"></video>'
									);
								}

								// ✅ (중요) videolocal 내부 오버레이(localControls) 방식 제거
								// if ($('#localControls').length === 0) { ... }  <-- 이 블록 삭제
								// $('#localControls').html(`...`)               <-- 이 블록 삭제

								// ✅ 버튼은 "헤더"에서 보여주고 이벤트만 연결
								$('#localControlsHead').removeClass('hide').show();

								$('#mute').off('click').on('click', toggleMute);
								$('#unpublish').off('click').on('click', unpublishOwnFeed);

								Janus.attachMediaStream($('#myvideo').get(0), stream);
								$('#myvideo').get(0).muted = 'muted';
							},
							oncleanup: function () {
								Janus.log(' ::: Got a cleanup notification: we are unpublished now :::');
								mystream = null;
								$('#videolocal').html('<button id="publish" class="btn btn-primary">Publish</button>');
								$('#publish').click(function () {
									publishOwnFeed(true);
								});
								$('#videolocal').parent().parent().unblock();
								$('#bitrate').parent().parent().addClass('hide');
								$('#bitrate a').unbind('click');
							},
						});
					},
					error: function (error) {
						Janus.error(error);
						bootbox.alert(error, function () {
							window.location.reload();
						});
					},
					destroyed: function () {
						window.location.reload();
					},
				});
			});
		},
	});
});

function checkEnter(field, event) {
	var theCode = event.keyCode ? event.keyCode : event.which ? event.which : event.charCode;
	if (theCode == 13) {
		registerUsername();
		return false;
	} else {
		return true;
	}
}

function registerUsername() {
	if ($('#roomname').length === 0) {
		// Create fields to register
		$('#register').click(registerUsername);
		$('#roomname').focus();
	} else if ($('#username').length === 0) {
		// Create fields to register
		$('#register').click(registerUsername);
		$('#username').focus();
	} else {
		// Try a registration
		$('#username').attr('disabled', true);
		$('#register').attr('disabled', true).unbind('click');

		// ✅ 사용자가 입력하는 값 = DB roomCode (상담 식별용)
		var roomname = ($('#roomname').val() || '').trim();

		if (roomname === '') {
			$('#room')
				.removeClass()
				.addClass('label label-warning')
				.html('상담방 코드를 입력하세요. (상담 확정 시 받은 코드)');
			$('#roomname').removeAttr('disabled').focus();
			$('#register').removeAttr('disabled').click(registerUsername);
			return;
		}

		// (선택) 코드 길이 제한 정도만 — 너무 빡세게 막지 말기
		if (roomname.length > 50) {
			$('#room').removeClass().addClass('label label-warning').html('상담방 코드는 50자 이하로 입력해주세요.');
			$('#roomname').removeAttr('disabled').focus();
			$('#register').removeAttr('disabled').click(registerUsername);
			return;
		}

		var username = ($('#username').val() || '').trim();
		if (username === '') {
			$('#you').removeClass().addClass('label label-warning').html('채팅방에서 사용할 닉네임을 입력해주세요.');
			$('#username').removeAttr('disabled').focus();
			$('#register').removeAttr('disabled').click(registerUsername);
			return;
		}
		if (!/^[가-힣a-zA-Z0-9 ]{2,20}$/.test(username)) {
			$('#you')
				.removeClass()
				.addClass('label label-warning')
				.html('닉네임은 한글/영문/숫자(공백 가능)로 2~20자만 가능합니다.');
			$('#username').removeAttr('disabled').val('').focus();
			$('#register').removeAttr('disabled').click(registerUsername);

			// API 검증
			// 버튼 상태 변경 (중복 클릭 방지)
			$('#register').attr('disabled', true).text('검증 중...');
			$('#roomname').attr('disabled', true);
			$('#username').attr('disabled', true);

			return;
		}
		// 룸코드 검증
		var token = localStorage.getItem('token');
		
		fetch('http://localhost:8888/api/reserve/verify?code=' + encodeURIComponent(roomname), {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + token,
				'Content-Type': 'application/json',
			},
		})
			.then((response) => response.json()) // 서버가 true 또는 false를 JSON으로 준다고 가정
			.then((isValid) => {
				if (isValid === true) {
					// 할당된 방이 맞으면 Janus 입장 로직 실행
					// "상담방 코드"는 저장만(메모 식별용)
					myroomCodeRaw = roomname;

					// 실제 Janus join은 1234로 고정 (사용자에게는 안 보임)
					myroom = 1234;

					myusername = username;

					var register = {
						request: 'join',
						room: myroom, // ✅ 항상 1234
						ptype: 'publisher',
						display: username,
					};
					sfutest.send({ message: register });

					// 입력 폼 숨기기
					$('#registernow').addClass('hide');
				} else {
					// 할당되지 않은 방인 경우
					bootbox.alert('상담방 코드를 다시 확인해주세요.');
					resetUI();
					return;
				}
			})
			.catch((error) => {
				console.error('검증 오류:', error);
				bootbox.alert('서버 통신 중 오류가 발생했습니다.');
				resetUI();
			});
	}

	// UI를 다시 입력 가능한 상태로 되돌리는 함수
	function resetUI() {
		$('#roomname').removeAttr('disabled');
		$('#username').removeAttr('disabled');
		$('#register').removeAttr('disabled').text('입장').unbind('click').click(registerUsername);
		return;
	}
}

// [jsflux] 방 참여자
function participantsList(room) {
	var listHtml = '';
	var roomPQuery = {
		request: 'listparticipants',
		room: Number(room),
	};
	sfutest.send({
		message: roomPQuery,
		success: function (result) {
			console.log('participants List: ' + JSON.stringify(result));
			var listP = result['participants'];
			listHtml += '<table>';
			$(listP).each(function (i, object) {
				listHtml += '<tr>';
				listHtml += '   <td>' + object.display + '</td>';
				listHtml += '   <td>' + object.talking + '</td>';
				listHtml += '</tr>';
			});
			listHtml += '</table>';
			$('#room_' + room).html(listHtml);
		},
	});
}

// [jsflux] 내 화상화면 시작
function publishOwnFeed(useAudio) {
	// Publish our stream
	$('#publish').attr('disabled', true).unbind('click');
	sfutest.createOffer({
		// Add data:true here if you want to publish datachannels as well
		media: {
			audioRecv: false,
			videoRecv: false,
			audioSend: useAudio,
			videoSend: true,
		}, // Publishers are sendonly
		// If you want to test simulcasting (Chrome and Firefox only), then
		// pass a ?simulcast=true when opening this demo page: it will turn
		// the following 'simulcast' property to pass to janus.js to true
		simulcast: doSimulcast,
		simulcast2: doSimulcast2,
		success: function (jsep) {
			Janus.debug('Got publisher SDP!', jsep);
			var publish = { request: 'configure', audio: useAudio, video: true };
			// You can force a specific codec to use when publishing by using the
			// audiocodec and videocodec properties, for instance:
			// 		publish["audiocodec"] = "opus"
			// to force Opus as the audio codec to use, or:
			// 		publish["videocodec"] = "vp9"
			// to force VP9 as the videocodec to use. In both case, though, forcing
			// a codec will only work if: (1) the codec is actually in the SDP (and
			// so the browser supports it), and (2) the codec is in the list of
			// allowed codecs in a room. With respect to the point (2) above,
			// refer to the text in janus.plugin.videoroom.jcfg for more details
			sfutest.send({ message: publish, jsep: jsep });
		},
		error: function (error) {
			Janus.error('WebRTC error:', error);
			if (useAudio) {
				publishOwnFeed(false);
			} else {
				bootbox.alert('WebRTC error... ' + error.message);
				$('#publish')
					.removeAttr('disabled')
					.click(function () {
						publishOwnFeed(true);
					});
			}
		},
	});
}

// [jsflux] 음소거
function toggleMute() {
	var muted = sfutest.isAudioMuted();
	Janus.log((muted ? 'Unmuting' : 'Muting') + ' local stream...');
	if (muted) sfutest.unmuteAudio();
	else sfutest.muteAudio();
	muted = sfutest.isAudioMuted();
	$('#mute').html(muted ? 'Unmute' : 'Mute');
}

// [jsflux] 방나가기
function unpublishOwnFeed() {
	// Unpublish our stream
	$('#unpublish').attr('disabled', true).unbind('click');
	var unpublish = { request: 'unpublish' };
	sfutest.send({ message: unpublish });
}

// [jsflux] 새로운 유저 들어왔을때
function newRemoteFeed(id, display, audio, video) {
	// A new feed has been published, create a new plugin handle and attach to it as a subscriber
	var remoteFeed = null;
	janus.attach({
		plugin: 'janus.plugin.videoroom',
		opaqueId: opaqueId,
		success: function (pluginHandle) {
			remoteFeed = pluginHandle;
			remoteFeed.simulcastStarted = false;
			Janus.log('Plugin attached! (' + remoteFeed.getPlugin() + ', id=' + remoteFeed.getId() + ')');
			Janus.log('  -- This is a subscriber');
			// We wait for the plugin to send us an offer
			var subscribe = {
				request: 'join',
				room: myroom,
				ptype: 'subscriber',
				feed: id,
				private_id: mypvtid,
			};
			// In case you don't want to receive audio, video or data, even if the
			// publisher is sending them, set the 'offer_audio', 'offer_video' or
			// 'offer_data' properties to false (they're true by default), e.g.:
			// 		subscribe["offer_video"] = false;
			// For example, if the publisher is VP8 and this is Safari, let's avoid video
			if (
				Janus.webRTCAdapter.browserDetails.browser === 'safari' &&
				(video === 'vp9' || (video === 'vp8' && !Janus.safariVp8))
			) {
				if (video) video = video.toUpperCase();
				toastr.warning('Publisher is using ' + video + ", but Safari doesn't support it: disabling video");
				subscribe['offer_video'] = false;
			}
			remoteFeed.videoCodec = video;
			remoteFeed.send({ message: subscribe });
		},
		error: function (error) {
			Janus.error('  -- Error attaching plugin...', error);
			bootbox.alert('Error attaching plugin... ' + error);
		},
		onmessage: function (msg, jsep) {
			Janus.debug(' ::: Got a message (subscriber) :::', msg);
			var event = msg['videoroom'];
			Janus.debug('Event: ' + event);
			if (msg['error']) {
				bootbox.alert(msg['error']);
			} else if (event) {
				if (event === 'attached') {
					// Subscriber created and attached
					for (var i = 1; i < 6; i++) {
						if (!feeds[i]) {
							feeds[i] = remoteFeed;
							remoteFeed.rfindex = i;
							break;
						}
					}
					remoteFeed.rfid = msg['id'];
					remoteFeed.rfdisplay = msg['display'];
					if (!remoteFeed.spinner) {
						var target = document.getElementById('videoremote' + remoteFeed.rfindex);
						remoteFeed.spinner = new Spinner({ top: 100 }).spin(target);
					} else {
						remoteFeed.spinner.spin();
					}
					Janus.log(
						'Successfully attached to feed ' +
							remoteFeed.rfid +
							' (' +
							remoteFeed.rfdisplay +
							') in room ' +
							msg['room']
					);
					$('#remote' + remoteFeed.rfindex)
						.removeClass('hide')
						.html(remoteFeed.rfdisplay)
						.show();
				} else if (event === 'event') {
					// Check if we got a simulcast-related event from this publisher
					var substream = msg['substream'];
					var temporal = msg['temporal'];
					if ((substream !== null && substream !== undefined) || (temporal !== null && temporal !== undefined)) {
						if (!remoteFeed.simulcastStarted) {
							remoteFeed.simulcastStarted = true;
							// Add some new buttons
							addSimulcastButtons(
								remoteFeed.rfindex,
								remoteFeed.videoCodec === 'vp8' || remoteFeed.videoCodec === 'h264'
							);
						}
						// We just received notice that there's been a switch, update the buttons
						updateSimulcastButtons(remoteFeed.rfindex, substream, temporal);
					}
				} else {
					// What has just happened?
				}
			}
			if (jsep) {
				Janus.debug('Handling SDP as well...', jsep);
				// Answer and attach
				remoteFeed.createAnswer({
					jsep: jsep,
					// Add data:true here if you want to subscribe to datachannels as well
					// (obviously only works if the publisher offered them in the first place)
					media: { audioSend: false, videoSend: false }, // We want recvonly audio/video
					success: function (jsep) {
						Janus.debug('Got SDP!', jsep);
						var body = { request: 'start', room: myroom };
						remoteFeed.send({ message: body, jsep: jsep });
					},
					error: function (error) {
						Janus.error('WebRTC error:', error);
						bootbox.alert('WebRTC error... ' + error.message);
					},
				});
			}
		},
		iceState: function (state) {
			Janus.log('ICE state of this WebRTC PeerConnection (feed #' + remoteFeed.rfindex + ') changed to ' + state);
		},
		webrtcState: function (on) {
			Janus.log(
				'Janus says this WebRTC PeerConnection (feed #' + remoteFeed.rfindex + ') is ' + (on ? 'up' : 'down') + ' now'
			);
		},
		onlocalstream: function (stream) {
			// The subscriber stream is recvonly, we don't expect anything here
		},
		onremotestream: function (stream) {
			Janus.debug('Remote feed #' + remoteFeed.rfindex + ', stream:', stream);
			var addButtons = false;
			if ($('#remotevideo' + remoteFeed.rfindex).length === 0) {
				addButtons = true;
				// No remote video yet
				$('#videoremote' + remoteFeed.rfindex).append(
					'<video class="rounded centered" id="waitingvideo' + remoteFeed.rfindex + '" width="100%" height="100%" />'
				);
				$('#videoremote' + remoteFeed.rfindex).append(
					'<video class="rounded centered relative hide" id="remotevideo' +
						remoteFeed.rfindex +
						'" width="100%" height="100%" autoplay playsinline/>'
				);
				$('#videoremote' + remoteFeed.rfindex).append(
					'<span class="label label-primary hide" id="curres' +
						remoteFeed.rfindex +
						'" style="position: absolute; bottom: 0px; left: 0px; margin: 15px;"></span>' +
						'<span class="label label-info hide" id="curbitrate' +
						remoteFeed.rfindex +
						'" style="position: absolute; bottom: 0px; right: 0px; margin: 15px;"></span>'
				);
				// Show the video, hide the spinner and show the resolution when we get a playing event
				$('#remotevideo' + remoteFeed.rfindex).bind('playing', function () {
					if (remoteFeed.spinner) remoteFeed.spinner.stop();
					remoteFeed.spinner = null;
					$('#waitingvideo' + remoteFeed.rfindex).remove();
					if (this.videoWidth)
						$('#remotevideo' + remoteFeed.rfindex)
							.removeClass('hide')
							.show();
					var width = this.videoWidth;
					var height = this.videoHeight;
					$('#curres' + remoteFeed.rfindex)
						.removeClass('hide')
						.text(width + 'x' + height)
						.show();
					if (Janus.webRTCAdapter.browserDetails.browser === 'firefox') {
						// Firefox Stable has a bug: width and height are not immediately available after a playing
						setTimeout(function () {
							var width = $('#remotevideo' + remoteFeed.rfindex).get(0).videoWidth;
							var height = $('#remotevideo' + remoteFeed.rfindex).get(0).videoHeight;
							$('#curres' + remoteFeed.rfindex)
								.removeClass('hide')
								.text(width + 'x' + height)
								.show();
						}, 2000);
					}
				});
			}
			Janus.attachMediaStream($('#remotevideo' + remoteFeed.rfindex).get(0), stream);
			var videoTracks = stream.getVideoTracks();
			if (!videoTracks || videoTracks.length === 0) {
				// No remote video
				$('#remotevideo' + remoteFeed.rfindex).hide();
				if ($('#videoremote' + remoteFeed.rfindex + ' .no-video-container').length === 0) {
					$('#videoremote' + remoteFeed.rfindex).append(
						'<div class="no-video-container">' +
							'<i class="fa fa-video-camera fa-5 no-video-icon"></i>' +
							'<span class="no-video-text">No remote video available</span>' +
							'</div>'
					);
				}
			} else {
				$('#videoremote' + remoteFeed.rfindex + ' .no-video-container').remove();
				$('#remotevideo' + remoteFeed.rfindex)
					.removeClass('hide')
					.show();
			}
			if (!addButtons) return;
			if (
				Janus.webRTCAdapter.browserDetails.browser === 'chrome' ||
				Janus.webRTCAdapter.browserDetails.browser === 'firefox' ||
				Janus.webRTCAdapter.browserDetails.browser === 'safari'
			) {
				$('#curbitrate' + remoteFeed.rfindex)
					.removeClass('hide')
					.show();
				bitrateTimer[remoteFeed.rfindex] = setInterval(function () {
					// Display updated bitrate, if supported
					var bitrate = remoteFeed.getBitrate();
					$('#curbitrate' + remoteFeed.rfindex).text(bitrate);
					// Check if the resolution changed too
					var width = $('#remotevideo' + remoteFeed.rfindex).get(0).videoWidth;
					var height = $('#remotevideo' + remoteFeed.rfindex).get(0).videoHeight;
					if (width > 0 && height > 0)
						$('#curres' + remoteFeed.rfindex)
							.removeClass('hide')
							.text(width + 'x' + height)
							.show();
				}, 1000);
			}
		},
		oncleanup: function () {
			Janus.log(' ::: Got a cleanup notification (remote feed ' + id + ') :::');
			if (remoteFeed.spinner) remoteFeed.spinner.stop();
			remoteFeed.spinner = null;
			$('#remotevideo' + remoteFeed.rfindex).remove();
			$('#waitingvideo' + remoteFeed.rfindex).remove();
			$('#novideo' + remoteFeed.rfindex).remove();
			$('#curbitrate' + remoteFeed.rfindex).remove();
			$('#curres' + remoteFeed.rfindex).remove();
			if (bitrateTimer[remoteFeed.rfindex]) clearInterval(bitrateTimer[remoteFeed.rfindex]);
			bitrateTimer[remoteFeed.rfindex] = null;
			remoteFeed.simulcastStarted = false;
			$('#simulcast' + remoteFeed.rfindex).remove();
		},
	});
}

// Helper to parse query string
function getQueryStringValue(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
		results = regex.exec(location.search);
	return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Helpers to create Simulcast-related UI, if enabled
function addSimulcastButtons(feed, temporal) {
	var index = feed;
	$('#remote' + index)
		.parent()
		.append(
			'<div id="simulcast' +
				index +
				'" class="btn-group-vertical btn-group-vertical-xs pull-right">' +
				'	<div class"row">' +
				'		<div class="btn-group btn-group-xs" style="width: 100%">' +
				'			<button id="sl' +
				index +
				'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to higher quality" style="width: 33%">SL 2</button>' +
				'			<button id="sl' +
				index +
				'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to normal quality" style="width: 33%">SL 1</button>' +
				'			<button id="sl' +
				index +
				'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Switch to lower quality" style="width: 34%">SL 0</button>' +
				'		</div>' +
				'	</div>' +
				'	<div class"row">' +
				'		<div class="btn-group btn-group-xs hide" style="width: 100%">' +
				'			<button id="tl' +
				index +
				'-2" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 2" style="width: 34%">TL 2</button>' +
				'			<button id="tl' +
				index +
				'-1" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 1" style="width: 33%">TL 1</button>' +
				'			<button id="tl' +
				index +
				'-0" type="button" class="btn btn-primary" data-toggle="tooltip" title="Cap to temporal layer 0" style="width: 33%">TL 0</button>' +
				'		</div>' +
				'	</div>' +
				'</div>'
		);
	// Enable the simulcast selection buttons
	$('#sl' + index + '-0')
		.removeClass('btn-primary btn-success')
		.addClass('btn-primary')
		.unbind('click')
		.click(function () {
			toastr.info('Switching simulcast substream, wait for it... (lower quality)', null, { timeOut: 2000 });
			if (!$('#sl' + index + '-2').hasClass('btn-success'))
				$('#sl' + index + '-2')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			if (!$('#sl' + index + '-1').hasClass('btn-success'))
				$('#sl' + index + '-1')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			$('#sl' + index + '-0')
				.removeClass('btn-primary btn-info btn-success')
				.addClass('btn-info');
			feeds[index].send({ message: { request: 'configure', substream: 0 } });
		});
	$('#sl' + index + '-1')
		.removeClass('btn-primary btn-success')
		.addClass('btn-primary')
		.unbind('click')
		.click(function () {
			toastr.info('Switching simulcast substream, wait for it... (normal quality)', null, { timeOut: 2000 });
			if (!$('#sl' + index + '-2').hasClass('btn-success'))
				$('#sl' + index + '-2')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			$('#sl' + index + '-1')
				.removeClass('btn-primary btn-info btn-success')
				.addClass('btn-info');
			if (!$('#sl' + index + '-0').hasClass('btn-success'))
				$('#sl' + index + '-0')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			feeds[index].send({ message: { request: 'configure', substream: 1 } });
		});
	$('#sl' + index + '-2')
		.removeClass('btn-primary btn-success')
		.addClass('btn-primary')
		.unbind('click')
		.click(function () {
			toastr.info('Switching simulcast substream, wait for it... (higher quality)', null, { timeOut: 2000 });
			$('#sl' + index + '-2')
				.removeClass('btn-primary btn-info btn-success')
				.addClass('btn-info');
			if (!$('#sl' + index + '-1').hasClass('btn-success'))
				$('#sl' + index + '-1')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			if (!$('#sl' + index + '-0').hasClass('btn-success'))
				$('#sl' + index + '-0')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			feeds[index].send({ message: { request: 'configure', substream: 2 } });
		});
	if (!temporal)
		// No temporal layer support
		return;
	$('#tl' + index + '-0')
		.parent()
		.removeClass('hide');
	$('#tl' + index + '-0')
		.removeClass('btn-primary btn-success')
		.addClass('btn-primary')
		.unbind('click')
		.click(function () {
			toastr.info('Capping simulcast temporal layer, wait for it... (lowest FPS)', null, { timeOut: 2000 });
			if (!$('#tl' + index + '-2').hasClass('btn-success'))
				$('#tl' + index + '-2')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			if (!$('#tl' + index + '-1').hasClass('btn-success'))
				$('#tl' + index + '-1')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			$('#tl' + index + '-0')
				.removeClass('btn-primary btn-info btn-success')
				.addClass('btn-info');
			feeds[index].send({ message: { request: 'configure', temporal: 0 } });
		});
	$('#tl' + index + '-1')
		.removeClass('btn-primary btn-success')
		.addClass('btn-primary')
		.unbind('click')
		.click(function () {
			toastr.info('Capping simulcast temporal layer, wait for it... (medium FPS)', null, { timeOut: 2000 });
			if (!$('#tl' + index + '-2').hasClass('btn-success'))
				$('#tl' + index + '-2')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			$('#tl' + index + '-1')
				.removeClass('btn-primary btn-info')
				.addClass('btn-info');
			if (!$('#tl' + index + '-0').hasClass('btn-success'))
				$('#tl' + index + '-0')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			feeds[index].send({ message: { request: 'configure', temporal: 1 } });
		});
	$('#tl' + index + '-2')
		.removeClass('btn-primary btn-success')
		.addClass('btn-primary')
		.unbind('click')
		.click(function () {
			toastr.info('Capping simulcast temporal layer, wait for it... (highest FPS)', null, { timeOut: 2000 });
			$('#tl' + index + '-2')
				.removeClass('btn-primary btn-info btn-success')
				.addClass('btn-info');
			if (!$('#tl' + index + '-1').hasClass('btn-success'))
				$('#tl' + index + '-1')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			if (!$('#tl' + index + '-0').hasClass('btn-success'))
				$('#tl' + index + '-0')
					.removeClass('btn-primary btn-info')
					.addClass('btn-primary');
			feeds[index].send({ message: { request: 'configure', temporal: 2 } });
		});
}

function updateSimulcastButtons(feed, substream, temporal) {
	// Check the substream
	var index = feed;
	if (substream === 0) {
		toastr.success('Switched simulcast substream! (lower quality)', null, {
			timeOut: 2000,
		});
		$('#sl' + index + '-2')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#sl' + index + '-1')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#sl' + index + '-0')
			.removeClass('btn-primary btn-info btn-success')
			.addClass('btn-success');
	} else if (substream === 1) {
		toastr.success('Switched simulcast substream! (normal quality)', null, {
			timeOut: 2000,
		});
		$('#sl' + index + '-2')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#sl' + index + '-1')
			.removeClass('btn-primary btn-info btn-success')
			.addClass('btn-success');
		$('#sl' + index + '-0')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
	} else if (substream === 2) {
		toastr.success('Switched simulcast substream! (higher quality)', null, {
			timeOut: 2000,
		});
		$('#sl' + index + '-2')
			.removeClass('btn-primary btn-info btn-success')
			.addClass('btn-success');
		$('#sl' + index + '-1')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#sl' + index + '-0')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
	}
	// Check the temporal layer
	if (temporal === 0) {
		toastr.success('Capped simulcast temporal layer! (lowest FPS)', null, {
			timeOut: 2000,
		});
		$('#tl' + index + '-2')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#tl' + index + '-1')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#tl' + index + '-0')
			.removeClass('btn-primary btn-info btn-success')
			.addClass('btn-success');
	} else if (temporal === 1) {
		toastr.success('Capped simulcast temporal layer! (medium FPS)', null, {
			timeOut: 2000,
		});
		$('#tl' + index + '-2')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#tl' + index + '-1')
			.removeClass('btn-primary btn-info btn-success')
			.addClass('btn-success');
		$('#tl' + index + '-0')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
	} else if (temporal === 2) {
		toastr.success('Capped simulcast temporal layer! (highest FPS)', null, {
			timeOut: 2000,
		});
		$('#tl' + index + '-2')
			.removeClass('btn-primary btn-info btn-success')
			.addClass('btn-success');
		$('#tl' + index + '-1')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
		$('#tl' + index + '-0')
			.removeClass('btn-primary btn-success')
			.addClass('btn-primary');
	}
}
